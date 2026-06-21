const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'kanda_secret_2026_key_super_secure';
const DB_PATH = path.join(__dirname, 'database.sqlite');

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
    initializeTables();
  }
});

// Helper function to run DB operations with promises
function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Database schema initialization
async function initializeTables() {
  try {
    // Newsletter Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inquiries Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        interest TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Callbacks Table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS callbacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        property_title TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users Table (Admin authentication)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )
    `);

    // Create default admin user if not exists
    const admin = await dbGet('SELECT * FROM users WHERE username = ?', ['admin']);
    if (!admin) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'kanda2026';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(defaultPassword, salt);
      await dbRun('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', hash]);
      console.log(`Default admin user created successfully with password source: ${process.env.ADMIN_PASSWORD ? 'Environment Variable' : 'Default Preset'}`);
    }
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

// Middleware: Authenticate JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Subscribe to newsletter
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    await dbRun('INSERT INTO newsletter (email) VALUES (?)', [email.trim().toLowerCase()]);
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Email is already subscribed.' });
    }
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Submit contact inquiry
app.post('/api/inquiry', async (req, res) => {
  const { name, email, phone, interest, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    await dbRun(
      'INSERT INTO inquiries (name, email, phone, interest, message) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone.trim(), interest || 'General', message.trim()]
    );
    res.status(201).json({ message: 'Inquiry submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// Submit callback request
app.post('/api/callback', async (req, res) => {
  const { name, phone, propertyTitle } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Please fill in your name and phone number.' });
  }

  try {
    await dbRun(
      'INSERT INTO callbacks (name, phone, property_title) VALUES (?, ?, ?)',
      [name.trim(), phone.trim(), propertyTitle ? propertyTitle.trim() : null]
    );
    res.status(201).json({ message: 'Callback request registered!' });
  } catch (err) {
    res.status(500).json({ error: 'Database error. Please try again.' });
  }
});

// ==========================================
// ADMIN PROTECTED API ENDPOINTS
// ==========================================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all submissions & stats
app.get('/api/admin/submissions', authenticateToken, async (req, res) => {
  try {
    const newsletter = await dbAll('SELECT * FROM newsletter ORDER BY created_at DESC');
    const inquiries = await dbAll('SELECT * FROM inquiries ORDER BY created_at DESC');
    const callbacks = await dbAll('SELECT * FROM callbacks ORDER BY created_at DESC');

    // Aggregate statistics
    const stats = {
      totalSubscribers: newsletter.length,
      totalInquiries: inquiries.length,
      totalCallbacks: callbacks.length,
      pendingInquiries: inquiries.filter(i => i.status === 'Pending').length,
      pendingCallbacks: callbacks.filter(c => c.status === 'Pending').length
    };

    res.json({ newsletter, inquiries, callbacks, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve database entries.' });
  }
});

// Update status of Inquiry or Callback
app.post('/api/admin/update-status', authenticateToken, async (req, res) => {
  const { type, id, status } = req.body;

  if (!type || !id || !status) {
    return res.status(400).json({ error: 'Type, ID, and status are required.' });
  }

  if (type !== 'inquiry' && type !== 'callback') {
    return res.status(400).json({ error: 'Invalid submission type.' });
  }

  const table = type === 'inquiry' ? 'inquiries' : 'callbacks';

  try {
    await dbRun(`UPDATE ${table} SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'Status updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry status.' });
  }
});

// Delete a submission
app.delete('/api/admin/submission', authenticateToken, async (req, res) => {
  const { type, id } = req.body;

  if (!type || !id) {
    return res.status(400).json({ error: 'Type and ID are required.' });
  }

  let table = '';
  if (type === 'newsletter') table = 'newsletter';
  else if (type === 'inquiry') table = 'inquiries';
  else if (type === 'callback') table = 'callbacks';
  else return res.status(400).json({ error: 'Invalid submission type.' });

  try {
    await dbRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.json({ message: 'Entry deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete database entry.' });
  }
});

// ==========================================
// STATIC FILES & PRODUCTION ROUTING
// ==========================================

// Serve static assets in production build
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Admin routing
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(distPath, 'admin.html'));
  });

  // Default fallback routing (SPA/index.html)
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
