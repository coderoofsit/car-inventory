const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  customField: {
    carExchange: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('Contact', contactSchema); 