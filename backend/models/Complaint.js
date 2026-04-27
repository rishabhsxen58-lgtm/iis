const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  priority: { type: String, required: true },
  location: { type: String, required: true },
  summary: { type: String, required: true },
  originalText: { type: String },
  suggestedSolution: { type: String },
  status: { type: String, default: 'Pending' },
  actionTaken: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
