const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true, unique: true },
  companyPassword: { type: String, required: true },
  companyPhone: { type: String, required: true },
  companyDescription: { type: String },
  companyWebsite: { type: String },
  companyLocation: { type: String },
  companyDifficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'] }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
