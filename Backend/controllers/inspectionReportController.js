const InspectionReport = require('../models/inspectionReport');

// Create a new inspection report
exports.createInspectionReport = async (req, res) => {
  try {
    const report = new InspectionReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update an existing inspection report by ID
exports.updateInspectionReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await InspectionReport.findByIdAndUpdate(id, req.body, { new: true });
    if (!report) return res.status(404).json({ error: 'Inspection report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get inspection report by car ID
exports.getInspectionReportByCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const report = await InspectionReport.findOne({ car: carId });
    if (!report) return res.status(404).json({ error: 'Inspection report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get inspection report by report ID
exports.getInspectionReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await InspectionReport.findById(id);
    if (!report) return res.status(404).json({ error: 'Inspection report not found' });
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 