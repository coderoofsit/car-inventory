const mongoose = require('mongoose');

const testDriveSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  preferredDate: String,
  preferredTime: String,
  message: String,
  customField: {
    carexchange: { type: String, enum: ['Yes', 'No'], default: 'No' },
    make: { type: String },
    model: { type: String },
    year: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('TestDrive', testDriveSchema); 