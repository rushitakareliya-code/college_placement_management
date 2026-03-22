const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Placement = require('../models/Placement'); // make sure Placement model is imported

// ✅ Get all jobs (for job listing page)
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// ✅ Get single job by ID (for job detail page)
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(id)
      .populate('companyId', 'name logo description');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// ✅ Apply for job (create placement)
const applyForJob = async (req, res, next) => {
  try {
    const { studentId, jobId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: 'Invalid job or student ID' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if student applied already
    const existingPlacement = await Placement.findOne({ 
      student: studentId, 
      company: job.companyId 
    });
    if (existingPlacement) {
      return res.status(400).json({ message: 'Already applied to this company' });
    }

    // Create placement
    const placement = await Placement.create({ 
      student: studentId, 
      company: job.companyId 
    });

    res.status(201).json({ 
      message: 'Application submitted successfully!',
      placement 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  applyForJob
};