const express = require('express');
const router = express.Router();
const Requirement = require('../models/requirement');
const Car = require('../models/car');

// POST /api/requirements - Register a requirement
router.post('/', async (req, res) => {
  try {
    const { filters, contact } = req.body;
    // Check if any car matches the filters
    const query = {};
    if (filters.brand) query.brand = { $in: filters.brand };
    if (filters.model) query.model = { $in: filters.model };
    if (filters.bodyStyle) query.bodyStyle = { $in: filters.bodyStyle };
    if (filters.fuel) query.fuelTypeDetails = { $in: filters.fuel };
    if (filters.transmission) query.transmissionTypeDetails = filters.transmission;
    if (filters.ownership) query.ownership = filters.ownership;
    if (filters.minYear) query.manufactureYear = { $gte: filters.minYear };
    if (filters.maxYear) query.manufactureYear = { ...(query.manufactureYear || {}), $lte: filters.maxYear };
    if (filters.minPrice) query.sellingPrice = { $gte: filters.minPrice };
    if (filters.maxPrice) query.sellingPrice = { ...(query.sellingPrice || {}), $lte: filters.maxPrice };
    if (filters.minKmRun) query.kmRun = { $gte: filters.minKmRun };
    if (filters.maxKmRun) query.kmRun = { ...(query.kmRun || {}), $lte: filters.maxKmRun };

    const matches = await Car.find(query);
    if (matches.length > 0) {
      return res.json({ matches });
    }
    // Save requirement if no match
    await Requirement.create({ filters, contact });
    res.json({ message: 'Requirement registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requirements - List all requirements (admin/future use)
router.get('/', async (req, res) => {
  const requirements = await Requirement.find().sort({ createdAt: -1 });
  res.json(requirements);
});

module.exports = router; 