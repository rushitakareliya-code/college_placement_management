const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
