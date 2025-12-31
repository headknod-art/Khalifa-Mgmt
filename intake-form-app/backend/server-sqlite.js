
// Load environment variables from .env.local file
require('dotenv').config({ path: '.env.local' });

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = process.env.DB_PATH || 'intake.db';
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

// Initialize SQLite database
const dbPath = path.join(__dirname, DB_PATH);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the 'intake_forms' table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS intake_forms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            formData TEXT NOT NULL,
            submissionDate TEXT NOT NULL
        )`, (createErr) => {
            if (createErr) {
                console.error('Error creating table:', createErr.message);
            } else {
                console.log('Table "intake_forms" created or already exists.');
            }
        });
    }
});

// Route for form submission
app.post('/api/intake', (req, res) => {
    console.log('POST /api/intake received');
    console.log('Request body:', req.body);
    const { formData } = req.body;
    if (!formData) {
        console.log('No formData provided');
        return res.status(400).json({ message: 'Form data is required' });
    }

    const submissionDate = new Date().toISOString();
    const query = 'INSERT INTO intake_forms (formData, submissionDate) VALUES (?, ?)';
    
    db.run(query, [JSON.stringify(formData), submissionDate], function (err) {
        if (err) {
            console.error('Error inserting form data:', err.message);
            return res.status(500).json({ message: 'Failed to submit form', error: err.message });
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.status(200).json({ message: 'Form submitted successfully!', id: this.lastID });
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Listening on 0.0.0.0:${PORT}`);
});
