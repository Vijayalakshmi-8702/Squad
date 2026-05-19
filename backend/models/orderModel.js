const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customer: { type: String, required: true },
  date: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  paymentMethod: { type: String },
  paymentStatus: { type: String, default: 'Pending' },
  transactionId: { type: String },
  cardNumber: { type: String },
  cardName: { type: String },
  upiId: { type: String },
  items: [{
    id: Number,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    selectedColor: String
  }],
  shippingAddress: {
    address: String,
    city: String,
    zip: String,
    type: String
  },
  tracking: [{
    status: String,
    date: String,
    location: String,
    completed: Boolean
  }],
  currentStage: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
