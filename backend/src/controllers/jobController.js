const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Placement = require('../models/Placement');

// Get all jobs (for job listing page)
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('companyId', 'companyName companyEmail')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// Get single job by ID (for job detail page)
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    const job = await Job.findById(id).populate(
      'companyId',
      'companyName companyEmail companyDescription companyWebsite companyLocation'
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

// Apply for job: record placement + push student onto job.applicants
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

    const sid = studentId.toString();
    const alreadyOnJob = (job.applicants || []).some(
      (a) => a.student && a.student.toString() === sid
    );
    if (alreadyOnJob) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const existingForJob = await Placement.findOne({ student: studentId, job: jobId });
    if (existingForJob) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    await Placement.create({
      student: studentId,
      company: job.companyId,
      job: jobId,
    });

    job.applicants = job.applicants || [];
    job.applicants.push({ student: studentId, status: 'Pending' });
    await job.save();

    res.status(201).json({
      message: 'Application submitted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  applyForJob,
};
