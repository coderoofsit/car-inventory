const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  customField: {
    make: { type: String },
    model: { type: String },
    year: { type: String },
    price: { type: String }
  }
});

module.exports = mongoose.model('Contact', contactSchema); 