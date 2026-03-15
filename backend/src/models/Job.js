const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Applied', 'Selected', 'Rejected'], required: true }
}, { _id: false });

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eligibility: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  applicants: [applicantSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
