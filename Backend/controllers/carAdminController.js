const Car = require('../models/car');

// GET /api/admin/cars?status=Available&make=Toyota&model=Corolla&year=2022
exports.getFilteredCars = async (req, res) => {
  try {
    const { status, make, model, year, ...rest } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (make) filter.brand = make;
    if (model) filter.model = model;
    if (year) filter.manufactureYear = year;
    // Add more filters as needed
    const cars = await Car.find(filter);
    res.json({ cars });
  } catch (err) {
    console.error('[Admin] Error fetching filtered cars:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
};

// GET /api/admin/stats - Get car statistics for admin dashboard
exports.getCarStats = async (req, res) => {
  try {
    // Get all cars to calculate stats
    const cars = await Car.find({});
    
    const stats = {
      Available: { count: 0, minPrice: null, maxPrice: null },
      Sold: { count: 0, minPrice: null, maxPrice: null },
      Pending: { count: 0, minPrice: null, maxPrice: null },
      Reserved: { count: 0, minPrice: null, maxPrice: null }
    };

    // Process each car - using 'status' field only
    cars.forEach(car => {
      let status = car.status || 'Available';
      
      // Normalize the status values to match our expected categories
      status = normalizeStatus(status);
      
      const price = parseInt(car.sellingPrice) || 0;
      
      if (stats[status]) {
        stats[status].count++;
        
        if (price > 0) {
          if (stats[status].minPrice === null || price < stats[status].minPrice) {
            stats[status].minPrice = price;
          }
          if (stats[status].maxPrice === null || price > stats[status].maxPrice) {
            stats[status].maxPrice = price;
          }
        }
      }
    });

    // Set minPrice and maxPrice to 0 if no cars in category
    Object.keys(stats).forEach(status => {
      if (stats[status].minPrice === null) stats[status].minPrice = 0;
      if (stats[status].maxPrice === null) stats[status].maxPrice = 0;
    });

    console.log('📊 Car stats calculated:', stats);

    res.json({ 
      success: true,
      stats: stats,
      totalCars: cars.length 
    });
    
  } catch (err) {
    console.error('[Admin] Error fetching car stats:', err);
    res.status(500).json({ error: 'Failed to fetch car statistics' });
  }
};

// Alternative method using MongoDB aggregation (more efficient for large datasets)
exports.getCarStatsAggregated = async (req, res) => {
  try {
    const pipeline = [
      {
        $addFields: {
          priceAsNumber: { 
            $toInt: { 
              $ifNull: ["$sellingPrice", "0"] 
            } 
          },
          // Use status field first, then availability as fallback
          normalizedStatus: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "sold"] }, then: "Sold" },
                { case: { $eq: ["$status", "reserved"] }, then: "Reserved" },
                { case: { $eq: ["$status", "pending"] }, then: "Pending" },
                { case: { $eq: ["$status", "available"] }, then: "Available" },
                { case: { $eq: ["$availability", "Sold"] }, then: "Sold" },
                { case: { $eq: ["$availability", "Reserved"] }, then: "Reserved" },
                { case: { $eq: ["$availability", "Pending"] }, then: "Pending" },
                { case: { $eq: ["$availability", "Available"] }, then: "Available" }
              ],
              default: "Available"
            }
          }
        }
      },
      {
        $group: {
          _id: "$normalizedStatus",
          count: { $sum: 1 },
          minPrice: { $min: "$priceAsNumber" },
          maxPrice: { $max: "$priceAsNumber" }
        }
      }
    ];

    const results = await Car.aggregate(pipeline);
    
    // Initialize with all statuses
    const stats = {
      Available: { count: 0, minPrice: 0, maxPrice: 0 },
      Sold: { count: 0, minPrice: 0, maxPrice: 0 },
      Pending: { count: 0, minPrice: 0, maxPrice: 0 },
      Reserved: { count: 0, minPrice: 0, maxPrice: 0 }
    };

    // Fill in the actual data
    results.forEach(result => {
      const status = result._id || 'Available';
      if (stats[status]) {
        stats[status] = {
          count: result.count,
          minPrice: result.minPrice || 0,
          maxPrice: result.maxPrice || 0
        };
      }
    });

    // Get total count
    const totalCars = await Car.countDocuments();

    console.log('📊 Car stats (aggregated):', stats);

    res.json({ 
      success: true, 
      stats: stats,
      totalCars: totalCars 
    });
    
  } catch (err) {
    console.error('[Admin] Error fetching car stats (aggregated):', err);
    res.status(500).json({ error: 'Failed to fetch car statistics' });
  }
};

// Helper function to normalize status values
function normalizeStatus(status) {
  if (!status) return 'Available';
  
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'sold':
      return 'Sold';
    case 'reserved':
      return 'Reserved';
    case 'pending':
      return 'Pending';
    case 'available':
      return 'Available';
    default:
      return 'Available';
  }
}