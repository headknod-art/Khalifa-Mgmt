
// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const IntakeForm = require('./models/IntakeForm');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://intake-mongo:27017/khalifa_intake';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Enable CORS for all routes with proper headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json()); // For parsing application/json

// Connect to MongoDB
console.log('Connecting to MongoDB:', MONGODB_URI);
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Server starting without database connection - will retry...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Intake API is running',
    database: 'MongoDB'
  });
});

// Get all intake forms (with pagination and userId filter)
app.get('/api/intake', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.query.userId; // Optional filter by userId

    // Build query filter
    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    const forms = await IntakeForm.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await IntakeForm.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: forms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch forms', 
      error: error.message 
    });
  }
});

// Get single intake form by ID
app.get('/api/intake/:id', async (req, res) => {
  try {
    const form = await IntakeForm.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: form
    });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch form', 
      error: error.message 
    });
  }
});

// Route for form submission
app.post('/api/intake', async (req, res) => {
  try {
    console.log('POST /api/intake received');
    console.log('Request body:', req.body);

    const { formData, userId } = req.body;
    
    if (!formData) {
      console.log('No formData provided');
      return res.status(400).json({ 
        success: false,
        message: 'Form data is required' 
      });
    }

    if (!userId) {
      console.log('No userId provided');
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    // Create new intake form with userId
    const newForm = new IntakeForm({
      userId,
      formData,
      status: 'submitted',
      submittedAt: new Date()
    });

    // Save to MongoDB
    const savedForm = await newForm.save();

    console.log(`✅ Form submitted successfully. ID: ${savedForm._id}, User: ${userId}`);
    
    // Step: Trigger khalifa-mgmt to process the intake
    if (process.env.KHALIFA_MGMT_API_URL) {
      try {
        console.log('🔄 Triggering khalifa-mgmt intake processing...');
        const khalifaResponse = await fetch(`${process.env.KHALIFA_MGMT_API_URL}/api/intake/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.KHALIFA_API_KEY}`,
          },
          body: JSON.stringify({
            intakeId: savedForm._id,
            userId: userId,
            formData: formData,
            submissionId: savedForm.submissionId,
          }),
        });

        if (khalifaResponse.ok) {
          const khalifaData = await khalifaResponse.json();
          console.log(`✅ Khalifa-mgmt processing triggered:`, khalifaData);
        } else {
          console.warn(`⚠️  Khalifa-mgmt processing returned status: ${khalifaResponse.status}`);
        }
      } catch (khalifaError) {
        console.error('⚠️  Failed to trigger khalifa-mgmt processing:', khalifaError.message);
        // Don't fail the intake submission if khalifa-mgmt processing fails
      }
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Form submitted successfully!', 
      id: savedForm._id,
      userId: savedForm.userId,
      submissionId: savedForm.submissionId
    });
  } catch (error) {
    console.error('❌ Error submitting form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit form', 
      error: error.message 
    });
  }
});

// Update form status
app.put('/api/intake/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['submitted', 'under_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const updatedForm = await IntakeForm.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        notes: notes || '',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Form updated successfully',
      data: updatedForm
    });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update form', 
      error: error.message 
    });
  }
});

// Delete intake form
app.delete('/api/intake/:id', async (req, res) => {
  try {
    const deletedForm = await IntakeForm.findByIdAndDelete(req.params.id);

    if (!deletedForm) {
      return res.status(404).json({ 
        success: false,
        message: 'Form not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully',
      data: deletedForm
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete form', 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error', 
    error: err.message 
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Intake Form API running on http://localhost:${PORT}`);
  console.log(`📊 Database: MongoDB (${MONGODB_URI})`);
  console.log(`🔒 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET    /api/health              - Health check`);
  console.log(`  GET    /api/intake              - Get all forms (paginated)`);
  console.log(`  GET    /api/intake/:id          - Get specific form`);
  console.log(`  POST   /api/intake              - Submit new form`);
  console.log(`  PUT    /api/intake/:id/status   - Update form status`);
  console.log(`  DELETE /api/intake/:id          - Delete form\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    console.log('✅ Server and database connections closed');
    process.exit(0);
  });
});

module.exports = app;
