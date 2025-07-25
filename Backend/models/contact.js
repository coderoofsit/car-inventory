const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  customField: {
    carexchange: { type: String},
    make: { type: String },
    model: { type: String },
    year: { type: String },
    carId: { type: String }
  }
});

module.exports = mongoose.model('Contact', contactSchema); 