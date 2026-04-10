const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  // Snapshot fields – preserved even if the job/company is later deleted
  jobTitle: { type: String, default: '' },
  jobCompany: { type: String, default: '' },
  // Application form data
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resume: { type: String }, // file path
  skills: { type: String, required: true },
  experience: { type: String, required: true },
  qualification: { type: String, required: true },
  currentLocation: { type: String, required: true },
  expectedSalary: { type: String, required: true },
  projects: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Shortlisted', 'Selected', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
