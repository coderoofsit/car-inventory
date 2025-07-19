const express = require('express');
const router = express.Router();
const carAdminController = require('../controllers/carAdminController');

// GET /api/admin/cars
router.get('/cars', carAdminController.getFilteredCars);
// GET /api/admin/stats - Get car statistics for dashboard
router.get('/stats', carAdminController.getCarStats);

// Alternative aggregated stats endpoint (more efficient for large datasets)
router.get('/stats/aggregated', carAdminController.getCarStatsAggregated);

module.exports = router; 