const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Coupon = require('./models/couponModel');

const categoryData = {
  sofa: {
    basePrice: 24999,
    items: [
      { name: 'Luxury Velvet Sofa',     image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
      { name: 'L-Shaped Sectional Sofa', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80' },
      { name: 'Chesterfield Leather Sofa', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80' },
      { name: 'Minimalist Daybed Sofa',  image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80' },
      { name: 'Modern Futon Sleeper',   image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80' }
    ]
  },
  chair: {
    basePrice: 5999,
    items: [
      { name: 'Nordic Lounge Chair',    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80' },
      { name: 'Ergonomic Office Chair', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80' },
      { name: 'Wingback Accent Chair',  image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=80' },
      { name: 'Rattan Armchair',        image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80' },
      { name: 'Rocking Leisure Chair',  image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80' }
    ]
  },
  table: {
    basePrice: 8999,
    items: [
      { name: 'Solid Oak Dining Table', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80' },
      { name: 'Walnut Coffee Table',    image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80' },
      { name: 'Electric Standing Desk', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80' },
      { name: 'Glass Top Study Table',  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
      { name: 'Nesting Side Tables',    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80' }
    ]
  },
  bed: {
    basePrice: 19999,
    items: [
      { name: 'King Platform Bed',      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80' },
      { name: 'Wooden Canopy Bed',      image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80' },
      { name: 'Tufted Queen Bed',       image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
      { name: 'Single Storage Bed',     image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80' },
      { name: 'Memory Foam Mattress',   image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80' }
    ]
  },
  storage: {
    basePrice: 7999,
    items: [
      { name: 'Minimalist Bookshelf',   image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&q=80' },
      { name: 'Oak Sideboard Cabinet',  image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80' },
      { name: 'Modern Wardrobe Closet', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80' },
      { name: '6-Drawer Dresser Chest', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80' },
      { name: 'Floating Wall Shelves',  image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=800&q=80' }
    ]
  }
};

const products = [];
let idCounter = 1;

Object.keys(categoryData).forEach(category => {
  const data = categoryData[category];
  for (let i = 0; i < 20; i++) {
    const item = data.items[i % data.items.length];
    const generation = Math.floor(i / data.items.length) + 1;
    const price = data.basePrice + Math.floor(Math.random() * data.basePrice * 0.8);
    products.push({
      id: idCounter++,
      name: generation === 1 ? item.name : `${item.name} v${generation}`,
      category,
      price,
      originalPrice: Math.round(price / 0.85),
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      reviews: Math.floor(Math.random() * 450) + 50,
      image: item.image,
      badge: i % 5 === 0 ? 'Sale' : i % 7 === 0 ? 'New' : null,
      description: `Premium quality ${item.name.toLowerCase()} crafted for modern lifestyles. Includes home delivery.`,
      features: ['Premium Quality', '100% Authentic', '1 Year Warranty', 'Express Shipping'],
      inStock: i % 9 !== 0,
      likesCount: 0,
      reviewsList: [
        { id: 'rev-1', user: 'Amit Sharma', rating: 5, comment: 'Exceptional build quality and very comfortable!', date: '12/04/2026' },
        { id: 'rev-2', user: 'Priya Nair', rating: 4, comment: 'Great wood texture. Matches our living room design perfectly.', date: '18/04/2026' }
      ]
    });
  }
});

const coupons = [
  { code: 'FURNI20', discountType: 'percentage', discountValue: 20, minPurchase: 5000, expiryDate: new Date('2028-12-31'), isActive: true },
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 1000, expiryDate: new Date('2028-12-31'), isActive: true },
  { code: 'FLAT2000', discountType: 'fixed', discountValue: 2000, minPurchase: 15000, expiryDate: new Date('2028-12-31'), isActive: true }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/furnitureStore';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);

    // Products Seeding
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Products seeded successfully:', products.length);

    // Coupons Seeding
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded successfully:', coupons.length);

    // Users Seeding
    await User.deleteMany({});
    
    // Seed Admin
    const admin = new User({
      name: 'Vijay Kumar',
      email: 'admin@furnishopsy.com',
      mobile: '9876543210',
      password: 'vijay123', // Will be hashed by pre-save hook
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VijayAdmin'
    });
    await admin.save();
    console.log('Admin user seeded:', admin.email);

    // Seed Normal Guest User
    const guest = new User({
      name: 'Guest User',
      email: 'guest@furnishopsy.com',
      mobile: '9999999999',
      password: 'guest123', // Will be hashed by pre-save hook
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser'
    });
    await guest.save();
    console.log('Guest user seeded:', guest.email);

    console.log('Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

// If run directly
if (require.main === module) {
  seedDB();
}

module.exports = { seedDB, products, coupons };
