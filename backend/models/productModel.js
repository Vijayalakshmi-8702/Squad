const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 12 },
  image: { type: String, required: true },
  images: [{ type: String }],
  badge: { type: String },
  description: { type: String },
  features: [String],
  inStock: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  accentColor: { type: String },
  likesCount: { type: Number, default: 0 },
  availableColors: [String],
  brand: { type: String, default: 'FurniShopsy' },
  material: { type: String, default: 'Teak Wood' },
  stock: { type: Number, default: 15 },
  reviewsList: [{
    id: { type: String },
    user: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
