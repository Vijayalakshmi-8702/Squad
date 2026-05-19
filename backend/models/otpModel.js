const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // Mongoose TTL index: expires in 5 minutes from creation
  },
  purpose: {
    type: String,
    enum: ['register', 'login', 'reset'],
    required: true
  }
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);
module.exports = OTP;
