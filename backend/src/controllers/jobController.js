const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Placement = require('../models/Placement');

// Get all jobs (for job listing page)
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ 
      isActive: true,
      $or: [
        { deadline: { $exists: false } },
        { deadline: null },
        { deadline: { $gte: new Date() } }
      ]
    })
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
    const {
      studentId,
      jobId,
      fullName,
      email,
      phone,
      skills,
      experience,
      qualification,
      currentLocation,
      expectedSalary,
      projects
    } = req.body;

    console.log('Received IDs:', { studentId, jobId });
    console.log('StudentId valid:', mongoose.Types.ObjectId.isValid(studentId));
    console.log('JobId valid:', mongoose.Types.ObjectId.isValid(jobId));

    // Try to convert string IDs to ObjectIds if they're valid
    let validJobId = jobId;
    let validStudentId = studentId;

    if (typeof jobId === 'string' && mongoose.Types.ObjectId.isValid(jobId)) {
      validJobId = new mongoose.Types.ObjectId(jobId);
    }
    if (typeof studentId === 'string' && mongoose.Types.ObjectId.isValid(studentId)) {
      validStudentId = new mongoose.Types.ObjectId(studentId);
    }

    if (!mongoose.Types.ObjectId.isValid(validJobId) || !mongoose.Types.ObjectId.isValid(validStudentId)) {
      return res.status(400).json({ message: 'Invalid job or student ID' });
    }

    const job = await Job.findById(validJobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('Job found:', job);
    console.log('Job companyId:', job.companyId);
    console.log('Job companyId type:', typeof job.companyId);

    if (!job.companyId) {
      console.error('Job does not have companyId:', job);
      // Try to find company by name
      if (job.company) {
        const company = await Company.findOne({ companyName: { $regex: new RegExp('^' + job.company + '$', 'i') } });
        if (company) {
          job.companyId = company._id;
          await job.save();
          console.log('Updated job with companyId:', job.companyId);
        } else {
          // Last resort: create minimal placeholder company so application is allowed
          const placeholderEmail = `${job.company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@example.com`;
          const placeholder = await Company.create({
            companyName: job.company,
            companyEmail: placeholderEmail,
            companyPassword: 'Temp@1234',
            companyPhone: '0000000000',
            companyDescription: 'Auto-generated for missing company mapping'
          });
          job.companyId = placeholder._id;
          await job.save();
          console.log('Created placeholder company and updated job:', placeholder._id);
        }
      } else {
        return res.status(400).json({ message: 'Job does not have a valid company associated' });
      }
    }

    const sid = validStudentId.toString();
    const alreadyOnJob = (job.applicants || []).some(
      (a) => a.student && a.student.toString() === sid
    );
    if (alreadyOnJob) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const existingForJob = await Placement.findOne({ student: validStudentId, job: validJobId });
    if (existingForJob) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Handle resume upload
    let resumePath = null;
    if (req.file) {
      resumePath = req.file.path;
    }

    // Create placement with application data
    const placementData = {
      student: validStudentId,
      company: job.companyId,
      job: validJobId,
      fullName,
      email,
      phone,
      resume: resumePath,
      skills,
      experience,
      qualification,
      currentLocation,
      expectedSalary,
      projects,
      status: 'Pending'
    };

    console.log('Creating placement with data:', placementData);

    await Placement.create(placementData);

    job.applicants = job.applicants || [];
    job.applicants.push({ student: validStudentId, status: 'Pending' });
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
