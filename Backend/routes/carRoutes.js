const express = require('express');
const router = express.Router();
const uploadRoute = express.Router();
const Car = require('../models/car');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add a middleware for logging all requests to this router
router.use((req, res, next) => {
  console.log(`[carRoutes] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// --- UPLOAD ROUTE ONLY ---
uploadRoute.post('/', upload.single('media'), async (req, res) => {
  console.log('[carRoutes] POST /upload - Upload media');
  try {
    if (!req.file) {
      console.log('[carRoutes] No file received');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('[carRoutes] File received:', req.file.originalname, req.file.mimetype, req.file.size);
    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/avif'];
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('[carRoutes] Invalid file type:', req.file.mimetype);
      return res.status(400).json({ 
        error: 'Invalid file type. Supported formats: JPG, PNG, GIF, MP4, MOV, AVI, WebM' 
      });
    }
    // Upload to Cloudinary using a stream
    const streamUpload = (fileBuffer, resourceType = 'auto') => {
      return new Promise((resolve, reject) => {
        const uploadOptions = { 
          folder: 'car-inventory',
          resource_type: resourceType
        };
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };
    // Determine resource type based on mimetype
    const isVideo = allowedVideoTypes.includes(req.file.mimetype);
    const resourceType = isVideo ? 'video' : 'image';
    const result = await streamUpload(req.file.buffer, resourceType);
    console.log('[carRoutes] Cloudinary upload result:', result);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('[carRoutes] Error uploading media:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET all cars
router.get('/', async (req, res) => {
  console.log('[carRoutes] GET / - Fetch all cars');
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error('[carRoutes] Error fetching cars:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add filtering support to GET /api/cars
router.get('/cars', async (req, res) => {
  try {
    const query = {};
    // Multi-select fields: OR within field, AND between fields
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      query["brand"] = { $in: brands.map(b => new RegExp(`^${b}$`, 'i')) };
    }
    if (req.query.model) {
      const models = Array.isArray(req.query.model) ? req.query.model : [req.query.model];
      query["model"] = { $in: models.map(m => new RegExp(`^${m}$`, 'i')) };
    }
    if (req.query.bodyStyle) {
      const bodyStyles = Array.isArray(req.query.bodyStyle) ? req.query.bodyStyle : [req.query.bodyStyle];
      query["bodyStyleDetails"] = { $in: bodyStyles.map(bs => new RegExp(`^${bs}$`, 'i')) };
    }
    if (req.query.fuel) {
      const fuels = Array.isArray(req.query.fuel) ? req.query.fuel : [req.query.fuel];
      query["fuelTypeDetails"] = { $in: fuels.map(f => new RegExp(`^${f}$`, 'i')) };
    }
    if (req.query.transmission) {
      const transmissions = Array.isArray(req.query.transmission) ? req.query.transmission : [req.query.transmission];
      query["transmissionTypeDetails"] = { $in: transmissions.map(t => new RegExp(`^${t}$`, 'i')) };
    }
    if (req.query.ownership) {
      const ownerships = Array.isArray(req.query.ownership) ? req.query.ownership : [req.query.ownership];
      query["ownerDetails"] = { $in: ownerships.map(o => new RegExp(`^${o}$`, 'i')) };
    }
    // Search bar: match brand or model (case-insensitive, partial)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { brand: searchRegex },
        { model: searchRegex }
      ];
    }
    // Range filters (AND logic)
    if (req.query.minYear || req.query.maxYear) {
      query["manufactureYear"] = {};
      if (req.query.minYear) query["manufactureYear"].$gte = Number(req.query.minYear);
      if (req.query.maxYear) query["manufactureYear"].$lte = Number(req.query.maxYear);
    }
    if (req.query.minPrice || req.query.maxPrice) {
      query["sellingPrice"] = {};
      if (req.query.minPrice) query["sellingPrice"].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query["sellingPrice"].$lte = Number(req.query.maxPrice);
    }
    if (req.query.minKmRun || req.query.maxKmRun) {
      query["kmRun"] = {};
      if (req.query.minKmRun) query["kmRun"].$gte = Number(req.query.minKmRun);
      if (req.query.maxKmRun) query["kmRun"].$lte = Number(req.query.maxKmRun);
    }
    // Log the final query for debugging
    console.log('Car filter query:', JSON.stringify(query, null, 2));
    const cars = await Car.find(query);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/filters - Get all possible filter values and min/max for ranges
router.get('/filters', async (req, res) => {
  try {
    // Use aggregation to get unique values and min/max for ranges
    const [result] = await Car.aggregate([
      {
        $facet: {
          brands: [ { $group: { _id: "$brand" } } ],
          models: [ { $group: { _id: "$model" } } ],
          bodyStyles: [ { $group: { _id: "$bodyStyleDetails" } } ],
          fuelTypes: [ { $group: { _id: "$fuelTypeDetails" } } ],
          transmissions: [ { $group: { _id: "$transmissionTypeDetails" } } ],
          ownerships: [ { $group: { _id: "$ownerDetails" } } ],
          minYear: [ { $group: { _id: null, min: { $min: "$manufactureYear" } } } ],
          maxYear: [ { $group: { _id: null, max: { $max: "$manufactureYear" } } } ],
          minPrice: [ { $group: { _id: null, min: { $min: "$sellingPrice" } } } ],
          maxPrice: [ { $group: { _id: null, max: { $max: "$sellingPrice" } } } ],
          minKmRun: [ { $group: { _id: null, min: { $min: "$kmRun" } } } ],
          maxKmRun: [ { $group: { _id: null, max: { $max: "$kmRun" } } } ]
        }
      }
    ]);
    // Helper to flatten and filter out null/empty
    const flatten = arr => arr.map(x => x._id).filter(Boolean);
    res.json({
      brands: flatten(result.brands),
      models: flatten(result.models),
      bodyStyles: flatten(result.bodyStyles),
      fuelTypes: flatten(result.fuelTypes),
      transmissions: flatten(result.transmissions),
      ownerships: flatten(result.ownerships),
      minYear: result.minYear[0]?.min ?? 2000,
      maxYear: result.maxYear[0]?.max ?? 2024,
      minPrice: result.minPrice[0]?.min ?? 0,
      maxPrice: result.maxPrice[0]?.max ?? 1000000,
      minKmRun: result.minKmRun[0]?.min ?? 0,
      maxKmRun: result.maxKmRun[0]?.max ?? 200000
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new car
router.post('/cars', async (req, res) => {
  console.log('[carRoutes] POST / - Add new car');
  try {
    // Accept 'media' as the array of images/videos
    if (req.body.media && Array.isArray(req.body.media)) {
      req.body.images = req.body.media;
      delete req.body.media;
    }
    const car = new Car(req.body);
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (err) {
    console.error('[carRoutes] Error saving car:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET a single car by ID
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(car);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route for debugging
router.get('/test', (req, res) => {
  console.log('[carRoutes] GET /test - Test route hit');
  res.json({ message: 'Test route working' });
});

module.exports = { router, uploadRoute };
