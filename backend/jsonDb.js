const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, 'db_json');
const PRODUCTS_FILE = path.join(DB_DIR, 'products.json');
const ORDERS_FILE = path.join(DB_DIR, 'orders.json');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const COUPONS_FILE = path.join(DB_DIR, 'coupons.json');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Helper to read JSON file safely
const readJsonFile = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content || JSON.stringify(defaultData));
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
    return defaultData;
  }
};

// Helper to write JSON file safely
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
    return false;
  }
};

const jsonDb = {
  // PRODUCTS
  getProducts: () => readJsonFile(PRODUCTS_FILE),
  
  saveProducts: (products) => writeJsonFile(PRODUCTS_FILE, products),
  
  addProduct: (product) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
    const newProduct = {
      _id: 'json_prod_' + Date.now(),
      id: maxId + 1,
      likesCount: 0,
      reviewsList: [],
      inStock: true,
      isNew: true,
      isFeatured: false,
      ...product
    };
    products.push(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    return newProduct;
  },

  deleteProduct: (id) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const idStr = id.toString();
    const filtered = products.filter(p => p._id !== id && p.id?.toString() !== idStr);
    writeJsonFile(PRODUCTS_FILE, filtered);
    return true;
  },

  likeProduct: (id) => {
    const products = readJsonFile(PRODUCTS_FILE);
    const idStr = id.toString();
    let updatedProduct = null;
    const mapped = products.map(p => {
      if (p._id === id || p.id?.toString() === idStr) {
        p.likesCount = (p.likesCount || 0) + 1;
        updatedProduct = p;
      }
      return p;
    });
    writeJsonFile(PRODUCTS_FILE, mapped);
    return updatedProduct;
  },

  // ORDERS
  getOrders: () => {
    const orders = readJsonFile(ORDERS_FILE);
    return orders.sort((a, b) => b.id - a.id);
  },

  addOrder: (orderData) => {
    const orders = readJsonFile(ORDERS_FILE);
    const orderId = orderData.orderId || 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      _id: 'json_ord_' + Date.now(),
      id: Date.now(),
      orderId,
      date: new Date().toLocaleDateString(),
      status: 'Processing',
      currentStage: 0,
      tracking: [
        { status: 'Order Placed', date: new Date().toLocaleDateString(), completed: true, location: 'Local Store' },
        { status: 'Processing', date: 'Processing', completed: false, location: 'Warehouse Hub' },
        { status: 'Shipped from USA', date: 'Pending', completed: false, location: 'Origin Facility' },
        { status: 'Arrived in Destination Country', date: 'Pending', completed: false, location: 'Customs Office' },
        { status: 'Out for Delivery', date: 'Pending', completed: false, location: 'Local Hub' },
        { status: 'Delivered', date: 'Pending', completed: false, location: 'Shipping Address' }
      ],
      ...orderData
    };
    orders.push(newOrder);
    writeJsonFile(ORDERS_FILE, orders);
    return newOrder;
  },

  updateOrderStatus: (id, status, tracking, currentStage) => {
    const orders = readJsonFile(ORDERS_FILE);
    const idStr = id.toString();
    let updatedOrder = null;
    const mapped = orders.map(o => {
      if (o._id === id || o.id?.toString() === idStr || o.orderId === id) {
        o.status = status;
        if (tracking) o.tracking = tracking;
        if (currentStage !== undefined) o.currentStage = currentStage;
        updatedOrder = o;
      }
      return o;
    });
    writeJsonFile(ORDERS_FILE, mapped);
    return updatedOrder;
  },

  // USERS
  getUsers: () => readJsonFile(USERS_FILE),
  
  registerUser: (userData) => {
    const users = readJsonFile(USERS_FILE);
    if (users.some(u => u.email === userData.email || (userData.mobile && u.mobile === userData.mobile))) {
      return null; // User already exists
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    
    const newUser = {
      _id: 'json_user_' + Date.now(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name.replace(/\s+/g, '')}`,
      createdAt: new Date().toISOString(),
      role: 'user',
      addresses: [],
      cart: [],
      wishlist: [],
      ...userData,
      password: hashedPassword
    };
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    return newUser;
  },

  loginUser: (identifier, password) => {
    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => u.email === identifier || u.mobile === identifier);
    if (!user) return null;
    
    // Compare hashed password
    const isMatch = bcrypt.compareSync(password, user.password);
    return isMatch ? user : null;
  },

  updateUserProfile: (userId, name) => {
    const users = readJsonFile(USERS_FILE);
    let updatedUser = null;
    const mapped = users.map(u => {
      if (u._id === userId || u.id === userId) {
        u.name = name;
        u.avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`;
        updatedUser = u;
      }
      return u;
    });
    writeJsonFile(USERS_FILE, mapped);
    return updatedUser;
  },

  updateUserCart: (userId, cart) => {
    const users = readJsonFile(USERS_FILE);
    let updatedUser = null;
    const mapped = users.map(u => {
      if (u._id === userId || u.id === userId) {
        u.cart = cart;
        updatedUser = u;
      }
      return u;
    });
    writeJsonFile(USERS_FILE, mapped);
    return updatedUser;
  },

  updateUserWishlist: (userId, wishlist) => {
    const users = readJsonFile(USERS_FILE);
    let updatedUser = null;
    const mapped = users.map(u => {
      if (u._id === userId || u.id === userId) {
        u.wishlist = wishlist;
        updatedUser = u;
      }
      return u;
    });
    writeJsonFile(USERS_FILE, mapped);
    return updatedUser;
  },

  updateUserAddresses: (userId, addresses) => {
    const users = readJsonFile(USERS_FILE);
    let updatedUser = null;
    const mapped = users.map(u => {
      if (u._id === userId || u.id === userId) {
        u.addresses = addresses;
        updatedUser = u;
      }
      return u;
    });
    writeJsonFile(USERS_FILE, mapped);
    return updatedUser;
  },

  // COUPONS
  getCoupons: () => readJsonFile(COUPONS_FILE, [
    { code: 'FURNI20', discountType: 'percentage', discountValue: 20, minPurchase: 5000, expiryDate: new Date('2028-12-31').toISOString(), isActive: true },
    { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 1000, expiryDate: new Date('2028-12-31').toISOString(), isActive: true }
  ]),

  saveCoupons: (coupons) => writeJsonFile(COUPONS_FILE, coupons)
};

module.exports = jsonDb;
