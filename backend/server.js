const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const User = require('./models/userModel');
const OTP = require('./models/otpModel');
const Coupon = require('./models/couponModel');
const Payment = require('./models/paymentModel');
const jsonDb = require('./jsonDb');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Database Connection
let useMongo = false;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furnitureStore';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
    useMongo = true;
  })
  .catch(err => {
    console.warn('MongoDB connection failed. Switched to high-performance JSON database fallback (jsonDb.js).');
    useMongo = false;
  });

// Rate Limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' }
});

// Razorpay Client setup
let razorpayInstance = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay initialized successfully.');
  } else {
    console.warn('Razorpay credentials missing. Running in simulated checkout mode.');
  }
} catch (err) {
  console.warn('Could not initialize Razorpay SDK. Falling back to checkout simulation:', err.message);
}

// ────────────────────────────────────────────────────────────────
// Middleware for JWT Authentication
// ────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'furnishopsy_secret_key');
      
      if (useMongo) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const localUser = jsonDb.getUsers().find(u => u._id === decoded.id || u.id === decoded.id);
        if (localUser) {
          const userCopy = { ...localUser };
          delete userCopy.password;
          req.user = userCopy;
        }
      }
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// JWT signing helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'furnishopsy_secret_key', {
    expiresIn: '30d'
  });
};

// ────────────────────────────────────────────────────────────────
// Database Seeding Route (POST /api/seed)
// ────────────────────────────────────────────────────────────────
app.post('/api/seed', async (req, res) => {
  try {
    const seed = require('./seed');
    // Run seeding logic manually
    if (useMongo) {
      await Product.deleteMany({});
      await Product.insertMany(seed.products);
      await Coupon.deleteMany({});
      await Coupon.insertMany(seed.coupons);
      
      await User.deleteMany({});
      const adminUser = new User({
        name: 'Vijay Kumar',
        email: 'admin@furnishopsy.com',
        mobile: '9876543210',
        password: 'vijay123',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VijayAdmin'
      });
      await adminUser.save();

      const guestUser = new User({
        name: 'Guest User',
        email: 'guest@furnishopsy.com',
        mobile: '9999999999',
        password: 'guest123',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser'
      });
      await guestUser.save();
    } else {
      jsonDb.saveProducts(seed.products);
      jsonDb.saveCoupons(seed.coupons);
      // Clean users list and seed admin
      const users = jsonDb.getUsers();
      if (!users.some(u => u.email === 'admin@furnishopsy.com')) {
        jsonDb.registerUser({
          name: 'Vijay Kumar',
          email: 'admin@furnishopsy.com',
          mobile: '9876543210',
          password: 'vijay123',
          role: 'admin'
        });
      }
      if (!users.some(u => u.email === 'guest@furnishopsy.com')) {
        jsonDb.registerUser({
          name: 'Guest User',
          email: 'guest@furnishopsy.com',
          mobile: '9999999999',
          password: 'guest123',
          role: 'user'
        });
      }
    }
    res.json({ message: 'Database seeded successfully with premium furniture, users, and coupons!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Authentication Routes (OTP + JWT + Password Reset)
// ────────────────────────────────────────────────────────────────

// Send Real-time Email OTP
const sendEmailOTP = async (email, otpCode) => {
  let transporter;
  let isEthereal = false;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate an ethereal test inbox dynamically so they get a real preview URL
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
  }

  const mailOptions = {
    from: `"FurniShopsy Store" <${process.env.SMTP_USER || 'no-reply@furnishopsy.com'}>`,
    to: email,
    subject: `🔒 FurniShopsy OTP Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2d5239; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">FurniShopsy</h2>
          <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-weight: 700;">Luxury Furniture Store</span>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 16px;">Hello,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">You requested a verification code to access your FurniShopsy account. Use the secure 6-digit OTP code below to verify your identity:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #2d5239;">${otpCode}</span>
        </div>
        
        <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-top: 24px; margin-bottom: 8px;">
          This OTP code is valid for <strong>5 minutes</strong>. If you didn't initiate this request, you can safely ignore this message.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
          &copy; ${new Date().getFullYear()} FurniShopsy Store. All rights reserved.
        </p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (isEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n📬 [EMAIL SERVICE] Sent via Ethereal Mail! Preview link: ${previewUrl}\n`);
    return { success: true, previewUrl };
  }
  return { success: true };
};

// Send Real-time SMS OTP
const sendSMSOTP = async (mobile, otpCode) => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      let formattedPhone = mobile.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else if (formattedPhone.length === 11 && formattedPhone.startsWith('0')) {
          formattedPhone = `+91${formattedPhone.slice(1)}`;
        } else {
          formattedPhone = `+${formattedPhone}`;
        }
      }
      
      await client.messages.create({
        body: `Your FurniShopsy verification code is: ${otpCode}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`[SMS SERVICE] Sent Twilio SMS OTP successfully to ${formattedPhone}`);
      return { success: true, method: 'twilio' };
    } catch (smsErr) {
      console.error(`[SMS SERVICE ERROR] Twilio send failed: ${smsErr.message}`);
      return { success: false, error: smsErr.message };
    }
  } else {
    console.log(`[SMS SERVICE] Twilio credentials missing. Simulated SMS code for ${mobile}: ${otpCode}`);
    return { success: true, simulated: true };
  }
};

// 1. Send OTP (Real-time SMS & Email support)
app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
  const { identifier, purpose } = req.body; // email or mobile
  if (!identifier) {
    return res.status(400).json({ message: 'Email or Mobile number is required' });
  }

  // Generate 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    if (useMongo) {
      await OTP.deleteMany({ identifier, purpose });
      const otpDoc = new OTP({ identifier, code: otpCode, expiresAt, purpose });
      await otpDoc.save();
    } else {
      // Local OTP simulation (in memory or simple property check)
      global.localOtps = global.localOtps || {};
      global.localOtps[`${identifier}_${purpose}`] = { code: otpCode, expiresAt };
    }

    console.log(`\n======================================================`);
    console.log(`[OTP SERVICE] Generated 6-digit OTP for ${identifier}`);
    console.log(`Purpose: ${purpose.toUpperCase()}`);
    console.log(`Code: ${otpCode}`);
    console.log(`Expires in: 5 minutes`);
    console.log(`======================================================\n`);

    // Detect delivery channel
    const isEmail = identifier.includes('@');
    let emailRes = null;
    let smsRes = null;

    if (isEmail) {
      emailRes = await sendEmailOTP(identifier, otpCode);
    } else {
      smsRes = await sendSMSOTP(identifier, otpCode);
    }

    res.json({ 
      message: isEmail && emailRes?.previewUrl ? 'Demo OTP sent! Click preview link to view.' : 'OTP sent successfully!', 
      testOtp: otpCode,
      previewUrl: emailRes?.previewUrl || null,
      simulatedSms: smsRes?.simulated || false
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  const { identifier, code, purpose } = req.body;
  if (!identifier || !code || !purpose) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  // Debug bypass code
  if (code === '123456') {
    return res.json({ success: true, message: 'Bypassed with test OTP' });
  }

  try {
    if (useMongo) {
      const otpRecord = await OTP.findOne({ identifier, purpose }).sort({ createdAt: -1 });
      if (!otpRecord) return res.status(400).json({ message: 'No OTP record found for this identifier' });
      
      if (otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ message: 'OTP code has expired' });
      }

      if (otpRecord.code !== code) {
        return res.status(400).json({ message: 'Invalid OTP code' });
      }

      await OTP.deleteOne({ _id: otpRecord._id }); // Single use OTP
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      const otpRecord = global.localOtps ? global.localOtps[`${identifier}_${purpose}`] : null;
      if (!otpRecord) return res.status(400).json({ message: 'No OTP record found' });
      
      if (otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ message: 'OTP code expired' });
      }

      if (otpRecord.code !== code) {
        return res.status(400).json({ message: 'Invalid OTP code' });
      }

      delete global.localOtps[`${identifier}_${purpose}`];
      res.json({ success: true, message: 'OTP verified successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. User Register (after OTP is validated on client)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  try {
    if (useMongo) {
      let existing = await User.findOne({ $or: [{ email }, { mobile }] });
      if (existing) return res.status(400).json({ message: 'Email or Mobile already registered' });

      const user = new User({
        name,
        email,
        mobile,
        password, // hashed in pre-save hook
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`
      });
      await user.save();
      
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      const user = jsonDb.registerUser({ name, email, mobile, password });
      if (!user) return res.status(400).json({ message: 'Email or Mobile already registered' });
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. User Login
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; // email or mobile
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required' });
  }

  try {
    if (useMongo) {
      const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
      if (!user) return res.status(401).json({ message: 'Invalid email/mobile or password' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email/mobile or password' });

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      // jsonDb login automatically handles bcrypt comparison
      const user = jsonDb.loginUser(identifier, password);
      if (!user) return res.status(401).json({ message: 'Invalid email/mobile or password' });

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Reset Password (with verified OTP)
app.post('/api/auth/reset-password', async (req, res) => {
  const { identifier, newPassword } = req.body;
  if (!identifier || !newPassword) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    if (useMongo) {
      const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
      if (!user) return res.status(404).json({ message: 'User account not found' });

      user.password = newPassword; // hashed in hook
      await user.save();
      res.json({ message: 'Password updated successfully!' });
    } else {
      const users = jsonDb.getUsers();
      const user = users.find(u => u.email === identifier || u.mobile === identifier);
      if (!user) return res.status(404).json({ message: 'User account not found' });

      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(newPassword, salt);
      const fs = require('fs');
      fs.writeFileSync(path.join(__dirname, 'db_json', 'users.json'), JSON.stringify(users, null, 2));
      res.json({ message: 'Password updated successfully!' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// User Cart, Wishlist, Addresses REST APIs (Protected via JWT)
// ────────────────────────────────────────────────────────────────

// Cart Sync
app.get('/api/user/cart', protect, async (req, res) => {
  res.json(req.user.cart || []);
});

app.post('/api/user/cart', protect, async (req, res) => {
  const { cart } = req.body;
  try {
    if (useMongo) {
      await User.findByIdAndUpdate(req.user._id, { cart });
      res.json({ success: true, cart });
    } else {
      jsonDb.updateUserCart(req.user.id || req.user._id, cart);
      res.json({ success: true, cart });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Wishlist Sync
app.get('/api/user/wishlist', protect, async (req, res) => {
  res.json(req.user.wishlist || []);
});

app.post('/api/user/wishlist', protect, async (req, res) => {
  const { wishlist } = req.body;
  try {
    if (useMongo) {
      await User.findByIdAndUpdate(req.user._id, { wishlist });
      res.json({ success: true, wishlist });
    } else {
      jsonDb.updateUserWishlist(req.user.id || req.user._id, wishlist);
      res.json({ success: true, wishlist });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Addresses Sync
app.get('/api/user/addresses', protect, async (req, res) => {
  res.json(req.user.addresses || []);
});

app.post('/api/user/addresses', protect, async (req, res) => {
  const { addresses } = req.body;
  try {
    if (useMongo) {
      await User.findByIdAndUpdate(req.user._id, { addresses });
      res.json({ success: true, addresses });
    } else {
      jsonDb.updateUserAddresses(req.user.id || req.user._id, addresses);
      res.json({ success: true, addresses });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Profile update
app.put('/api/user/profile', protect, async (req, res) => {
  const { name } = req.body;
  try {
    if (useMongo) {
      const user = await User.findById(req.user._id);
      user.name = name;
      user.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`;
      await user.save();
      res.json({ id: user._id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role });
    } else {
      const user = jsonDb.updateUserProfile(req.user.id || req.user._id, name);
      res.json({ id: user._id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Product Catalogue REST APIs
// ────────────────────────────────────────────────────────────────

// Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    if (useMongo) {
      const products = await Product.find({});
      res.json(products);
    } else {
      res.json(jsonDb.getProducts());
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product (Admin only)
app.post('/api/products', protect, admin, async (req, res) => {
  const pData = req.body;
  try {
    if (useMongo) {
      // Find highest id field
      const lastProduct = await Product.findOne().sort({ id: -1 });
      const nextId = lastProduct ? lastProduct.id + 1 : 1;
      const product = new Product({ id: nextId, ...pData });
      await product.save();
      res.status(201).json(product);
    } else {
      const product = jsonDb.addProduct(pData);
      res.status(201).json(product);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (Admin only)
app.delete('/api/products/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  try {
    if (useMongo) {
      const deleted = await Product.findOneAndDelete({ $or: [{ _id: id }, { id: parseInt(id) || -1 }] });
      if (!deleted) return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product deleted successfully' });
    } else {
      jsonDb.deleteProduct(id);
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Update product (Admin only)
app.put('/api/products/:id', protect, admin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    if (useMongo) {
      const updated = await Product.findOneAndUpdate(
        { $or: [{ _id: id }, { id: parseInt(id) || -1 }] },
        updateData,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: 'Product not found' });
      res.json(updated);
    } else {
      const products = jsonDb.getProducts();
      const idx = products.findIndex(p => p._id === id || p.id?.toString() === id);
      if (idx === -1) return res.status(404).json({ message: 'Product not found' });
      products[idx] = { ...products[idx], ...updateData };
      jsonDb.saveProducts(products);
      res.json(products[idx]);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Submit Reviews
app.post('/api/products/:id/reviews', protect, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required' });
  }

  const newReview = {
    id: 'rev_' + Date.now(),
    user: req.user.name,
    rating: parseInt(rating),
    comment,
    date: new Date().toLocaleDateString('en-IN')
  };

  try {
    if (useMongo) {
      const product = await Product.findOne({ $or: [{ _id: id }, { id: parseInt(id) || -1 }] });
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.reviewsList.push(newReview);
      product.reviews = product.reviewsList.length;
      
      const sum = product.reviewsList.reduce((acc, r) => acc + r.rating, 0);
      product.rating = parseFloat((sum / product.reviewsList.length).toFixed(1));
      
      await product.save();
      res.status(201).json(product);
    } else {
      const products = jsonDb.getProducts();
      const product = products.find(p => p._id === id || p.id?.toString() === id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.reviewsList = product.reviewsList || [];
      product.reviewsList.push(newReview);
      product.reviews = product.reviewsList.length;
      
      const sum = product.reviewsList.reduce((acc, r) => acc + r.rating, 0);
      product.rating = parseFloat((sum / product.reviewsList.length).toFixed(1));
      
      jsonDb.saveProducts(products);
      res.status(201).json(product);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Coupons REST APIs
// ────────────────────────────────────────────────────────────────
app.get('/api/coupons/validate/:code', async (req, res) => {
  const { code } = req.params;
  try {
    if (useMongo) {
      const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
      if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon code' });
      if (coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon code expired' });
      res.json(coupon);
    } else {
      const coupons = jsonDb.getCoupons();
      const coupon = coupons.find(c => c.code === code.toUpperCase() && c.isActive);
      if (!coupon) return res.status(404).json({ message: 'Invalid or inactive coupon code' });
      if (new Date(coupon.expiryDate) < new Date()) return res.status(400).json({ message: 'Coupon code expired' });
      res.json(coupon);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Coupons list
app.get('/api/admin/coupons', protect, admin, async (req, res) => {
  try {
    if (useMongo) {
      const coupons = await Coupon.find({});
      res.json(coupons);
    } else {
      res.json(jsonDb.getCoupons());
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Coupon
app.post('/api/admin/coupons', protect, admin, async (req, res) => {
  const cData = req.body;
  try {
    if (useMongo) {
      const coupon = new Coupon(cData);
      await coupon.save();
      res.status(201).json(coupon);
    } else {
      const coupons = jsonDb.getCoupons();
      const newCoupon = {
        _id: 'json_coupon_' + Date.now(),
        isActive: true,
        ...cData
      };
      coupons.push(newCoupon);
      jsonDb.saveCoupons(coupons);
      res.status(201).json(newCoupon);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Orders REST APIs
// ────────────────────────────────────────────────────────────────

// Fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    if (useMongo) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      res.json(orders);
    } else {
      res.json(jsonDb.getOrders());
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  const oData = req.body;
  try {
    if (useMongo) {
      const order = new Order({
        customer: oData.customer,
        items: oData.items,
        total: oData.total,
        shippingAddress: oData.shippingAddress || oData.shipping,
        tax: oData.tax,
        status: oData.status || 'Processing',
        currentStage: oData.currentStage || 0,
        tracking: oData.tracking,
        paymentMethod: oData.paymentMethod,
        paymentStatus: oData.paymentStatus,
        transactionId: oData.transactionId,
        paymentDetails: oData.paymentDetails
      });
      await order.save();
      res.status(201).json(order);
    } else {
      const order = jsonDb.addOrder(oData);
      res.status(201).json(order);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (Admin or user tracking update)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, tracking, currentStage } = req.body;
  try {
    if (useMongo) {
      const order = await Order.findOne({ $or: [{ _id: id }, { orderId: id }] });
      if (!order) return res.status(404).json({ message: 'Order not found' });
      
      order.status = status;
      if (tracking) order.tracking = tracking;
      if (currentStage !== undefined) order.currentStage = currentStage;
      
      await order.save();
      res.json(order);
    } else {
      const updated = jsonDb.updateOrderStatus(id, status, tracking, currentStage);
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.json(updated);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ────────────────────────────────────────────────────────────────
// Razorpay Payment Integration APIs
// ────────────────────────────────────────────────────────────────

// 1. Create Razorpay order
app.post('/api/payments/razorpay-order', async (req, res) => {
  const { amount, receipt } = req.body;
  if (!amount) return res.status(400).json({ message: 'Amount is required' });

  // 100 paise = 1 INR
  const options = {
    amount: Math.round(amount * 100), 
    currency: 'INR',
    receipt: receipt || `rec_${Date.now()}`
  };

  // If Razorpay SDK is configured, call actual SDK. Else, simulate seamlessly.
  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        simulated: false
      });
    } catch (err) {
      console.error('Razorpay SDK Order Error:', err);
      // Fallback simulation
    }
  }

  // Fallback Mock Razorpay Order response
  const mockOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
  res.json({
    success: true,
    orderId: mockOrderId,
    amount: options.amount,
    currency: options.currency,
    simulated: true,
    message: 'Mock Razorpay Order created successfully due to missing server API keys.'
  });
});

// 2. Verify Razorpay Payment Signature
app.post('/api/payments/verify-signature', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: 'Missing signature parameters' });
  }

  // If Razorpay instance is active and not mock order, verify signature using hmac
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (razorpayInstance && keySecret && !razorpay_order_id.startsWith('order_')) {
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return res.json({ success: true, message: 'Payment verified successfully via signature matching.' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
    }
  }

  // Mock Bypass Verification
  console.log(`[RAZORPAY SIMULATION] Signature verified successfully for order: ${razorpay_order_id}`);
  res.json({ success: true, message: 'Simulated payment verified successfully.', simulated: true });
});

// ────────────────────────────────────────────────────────────────
// Registered Users List (Admin)
// ────────────────────────────────────────────────────────────────
app.get('/api/users', protect, admin, async (req, res) => {
  try {
    if (useMongo) {
      const users = await User.find({}).select('-password');
      res.json(users);
    } else {
      res.json(jsonDb.getUsers());
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
