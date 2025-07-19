const Car = require('../models/car');

// GET /api/stats/car-status
exports.getCarStatusStats = async (req, res) => {
  try {
    const stats = await Car.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    // Format for frontend: [{ status: 'Available', count: 10 }, ...]
    const formatted = stats.map(s => ({ status: s._id, count: s.count }));
    res.json({ stats: formatted });
  } catch (err) {
    console.error('[Stats] Error fetching car status stats:', err);
    res.status(500).json({ error: 'Failed to fetch car status stats' });
  }
}; 