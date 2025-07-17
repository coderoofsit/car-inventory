const express = require('express');
const router = express.Router();
const inspectionReportController = require('../controllers/inspectionReportController');

// Create a new inspection report
router.post('/', inspectionReportController.createInspectionReport);

// Update an inspection report by ID
router.put('/:id', inspectionReportController.updateInspectionReport);

// Get inspection report by car ID
router.get('/car/:carId', inspectionReportController.getInspectionReportByCar);

// Get inspection report by report ID
router.get('/:id', inspectionReportController.getInspectionReportById);

module.exports = router; 