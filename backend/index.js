require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { processComplaint, getAdminReview } = require('./aiService');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Admin Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ _id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Setup Initial Admin (One-time use)
app.post('/api/auth/setup', async (req, res) => {
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return res.status(400).json({ error: 'Admin already exists' });

  const admin = new User({ email: 'admin@gov.in', password: 'adminpassword' });
  await admin.save();
  res.json({ success: true, message: 'Admin created with: admin@gov.in / adminpassword' });
});

// For this project, we'll use a local MongoDB if no DB_URL is provided
const MONGO_URI = process.env.DB_URL || 'mongodb://127.0.0.1:27017/grievance_system';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/api/complaints', async (req, res) => {
  console.log('Received complaint submission:', req.body);
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Complaint text is required' });

    // 2-8. AI processes input, classifies, assigns priority, checks location, generates summary & solution
    const aiResult = await processComplaint(text);

    if (aiResult.location === 'MISSING') {
      return res.status(400).json({
        error: 'Location is missing',
        ai_response: aiResult.response_to_user,
        needs_location: true
      });
    }

    // 9. Store in database
    const newComplaint = new Complaint({
      originalText: text,
      category: aiResult.category,
      priority: aiResult.priority,
      location: aiResult.location,
      summary: aiResult.summary,
      suggestedSolution: aiResult.suggested_solution
    });
    
    await newComplaint.save();

    // 10. Send confirmation to user
    res.json({
      success: true,
      complaintId: newComplaint._id,
      response: aiResult.response_to_user,
      data: newComplaint
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/complaints', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    const categories = {};
    const priorities = { High: 0, Medium: 0, Low: 0 };
    let totalPriorityVal = 0;
    
    complaints.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
      priorities[c.priority] = (priorities[c.priority] || 0) + 1;
      totalPriorityVal += c.priority === 'High' ? 3 : c.priority === 'Medium' ? 2 : 1;
    });

    const categoryData = Object.keys(categories).map(name => ({ name, value: categories[name] }));
    const priorityData = Object.keys(priorities).map(name => ({ name, value: priorities[name] }));

    const commonCategory = Object.keys(categories).sort((a,b) => categories[b] - categories[a])[0] || 'None';
    const avgPriority = complaints.length === 0 ? 'N/A' : (totalPriorityVal / complaints.length > 2.2 ? 'High' : (totalPriorityVal / complaints.length > 1.4 ? 'Medium' : 'Low'));

    res.json({
      commonCategory,
      avgPriority,
      total: complaints.length,
      categoryData,
      priorityData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/complaints/:id/status', auth, async (req, res) => {
  try {
    const { status, actionTaken } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status, actionTaken }, { new: true });
    
    // Status Update Response logic
    res.json({ success: true, message: `Status updated to ${status}. Action: ${actionTaken}`, data: complaint });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
