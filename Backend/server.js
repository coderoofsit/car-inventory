const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

// Routes
const { router: carRoutes, uploadRoute: carUploadRoute } = require('./routes/carRoutes');
app.use('/api/cars/upload', carUploadRoute); // Only upload route, before express.json()
app.use(express.json());
app.use('/api', carRoutes); // All other car routes
const contactRoutes = require('./routes/contactRoutes');
app.use('/api/contacts', contactRoutes);
const testDriveRoutes = require('./routes/testDriveRoutes');
app.use('/api/test-drives', testDriveRoutes);
const requirementRoutes = require('./routes/requirementRoutes');
require('./models/requirement');
app.use(cors());
app.use('/api/requirements', requirementRoutes);
const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);
// const carAdminRoutes = require('./routes/carAdminRoutes');
// app.use('/api/admin', carAdminRoutes);
app.use('/api/admin', require('./routes/carAdminRoutes'))
// Inspection Report Routes
const inspectionReportRoutes = require('./routes/inspectionReportRoutes');
app.use('/api/inspection-reports', inspectionReportRoutes);

// ✅ Connect to MongoDB only once
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
