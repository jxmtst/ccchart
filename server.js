const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('jsonFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const jsonData = JSON.parse(req.file.buffer.toString());

    // Basic validation for ccusage JSON format
    if (!jsonData || typeof jsonData !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    res.json({
      success: true,
      data: jsonData,
      message: 'File uploaded and parsed successfully'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid JSON file',
      message: error.message
    });
  }
});

// Endpoint to fetch fresh ccusage data
app.get('/api/fetch-ccusage', async (req, res) => {
  try {
    // Execute ccusage command with --json flag using npx
    const { stdout, stderr } = await execPromise('npx ccusage@latest --json', {
      timeout: 30000 // 30 seconds timeout
    });

    if (stderr) {
      console.error('ccusage stderr:', stderr);
    }

    // Parse the JSON output
    const jsonData = JSON.parse(stdout);

    res.json({
      success: true,
      data: jsonData,
      message: 'Fresh ccusage data fetched successfully'
    });
  } catch (error) {
    console.error('Error executing ccusage:', error);

    // Check if ccusage command exists
    if (error.code === 127 || error.message.includes('command not found')) {
      return res.status(503).json({
        error: 'ccusage command not found',
        message: 'Please ensure ccusage is installed and available in PATH'
      });
    }

    res.status(500).json({
      error: 'Failed to fetch ccusage data',
      message: error.message
    });
  }
});

// Serve static files after API routes
app.use(express.static('public'));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
