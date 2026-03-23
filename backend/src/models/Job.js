const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    experience: { type: String, required: true },
    salary: { type: String, required: true },
    workingDays: { type: String, required: true },
    weekOff: { type: String, required: true },
    shift: { type: String, required: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    applicants: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        status: {
          type: String,
          enum: ['Pending', 'Selected', 'Rejected'],
          default: 'Pending',
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
