const Company = require('../models/Company');
const Job = require('../models/Job');
const Student = require('../models/Student');

// Post a new job (only approved companies)
const postJob = async (req, res, next) => {
  try {
    const companyId = req.user.id;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    if (company.isApproved === false) {
      return res.status(403).json({ message: 'Only approved companies can post jobs.' });
    }
    const { title, description, location, type, experience, salary, workingDays, weekOff, shift, responsibilities, requirements } = req.body;
    if (!title) return res.status(400).json({ message: 'Job title is required.' });
    const parseLines = (v) => {
      if (Array.isArray(v)) return v.filter(Boolean).map(String);
      if (typeof v === 'string' && v.trim()) {
        return v.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      }
      return [];
    };
    const job = await Job.create({
      role: title.trim(),
      company: company.companyName || '',
      location: location || '—',
      type: type || 'Full-time',
      experience: experience || '—',
      salary: salary != null && salary !== '' ? String(salary) : '—',
      workingDays: workingDays || '—',
      weekOff: weekOff || '—',
      shift: shift || '—',
      description: description || '',
      responsibilities: parseLines(responsibilities),
      requirements: parseLines(requirements),
      companyId
    });
    const populated = await Job.findById(job._id).populate('companyId', 'companyName');
    res.status(201).json({ message: 'Job posted successfully.', job: populated });
  } catch (error) {
    next(error);
  }
};

// View jobs posted by logged-in company
const getMyJobs = async (req, res, next) => {
  try {
    const companyId = req.user.id;
    const jobs = await Job.find({ companyId })
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// View applicants for a job (student name, email, status)
const getApplicantsForJob = async (req, res, next) => {
  try {
    const companyId = req.user.id;
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate('applicants.student', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== companyId) {
      return res.status(403).json({ message: 'You can only view applicants for your own jobs.' });
    }
    const applicants = job.applicants
      .filter(a => a.student)
      .map(a => ({
        studentId: a.student._id,
        name: a.student.name,
        email: a.student.email,
        status: a.status
      }));
    res.json({ jobTitle: job.role, applicants });
  } catch (error) {
    next(error);
  }
};

// Update application status (Selected or Rejected)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const companyId = req.user.id;
    const { jobId, studentId } = req.params;
    const { status } = req.body;
    if (!status || !['Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Selected or Rejected.' });
    }
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== companyId) {
      return res.status(403).json({ message: 'You can only update applicants for your own jobs.' });
    }
    const applicant = job.applicants.find(a => a.student.toString() === studentId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found for this job.' });
    applicant.status = status;
    await job.save();
    res.json({ message: 'Application status updated.', status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postJob,
  getMyJobs,
  getApplicantsForJob,
  updateApplicationStatus
};
