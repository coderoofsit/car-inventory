const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats/car-status
router.get('/car-status', statsController.getCarStatusStats);

module.exports = router; 