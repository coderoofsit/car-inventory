const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: Number,
  mileage: Number,
  location: String,
  fuel: String,
  transmission: String,
  image: String,
  condition: String,
  description: String,
  vin: String,
  availability: {
    type: String,
    enum: ['Available', 'Sold', 'Reserved'],
    default: 'Available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
