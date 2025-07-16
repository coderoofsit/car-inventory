const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  filters: {
    type: Object,
    required: true
  },
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  notified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Requirement', RequirementSchema); 