const Student = require('../models/Student');
const Job = require('../models/Job');
const Company = require('../models/Company');

// Get all approved jobs (company isApproved = true)
const getApprovedJobs = async (req, res, next) => {
  try {
    const approvedCompanies = await Company.find({ isApproved: true }).select('_id');
    const companyIds = approvedCompanies.map(c => c._id);
    const jobs = await Job.find({ company: { $in: companyIds } })
      .populate('company', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// Apply for a job (once per job, status "Applied")
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;
    const job = await Job.findById(jobId).populate('company', 'name isApproved');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (!job.company || !job.company.isApproved) {
      return res.status(400).json({ message: 'Job is not open for applications.' });
    }
    const alreadyApplied = job.applicants.some(
      a => a.student.toString() === studentId
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }
    job.applicants.push({ student: studentId, status: 'Applied' });
    await job.save();
    const updated = await Job.findById(jobId).populate('company', 'name');
    res.status(201).json({
      message: 'Application submitted successfully.',
      job: { _id: updated._id, title: updated.title, company: updated.company.name }
    });
  } catch (error) {
    next(error);
  }
};

// View applied jobs (title, company name, status)
const getAppliedJobs = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const jobs = await Job.find({ 'applicants.student': studentId })
      .populate('company', 'name')
      .select('title applicants company');
    const applied = jobs.map(job => {
      const app = job.applicants.find(a => a.student.toString() === studentId);
      return {
        jobId: job._id,
        title: job.title,
        companyName: job.company ? job.company.name : null,
        status: app ? app.status : null
      };
    });
    res.json(applied);
  } catch (error) {
    next(error);
  }
};

// Update student profile (skills and resume only)
const updateProfile = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { skills, resume } = req.body;
    const update = {};
    if (skills !== undefined) update.skills = Array.isArray(skills) ? skills : [];
    if (resume !== undefined) update.resume = resume;
    const student = await Student.findByIdAndUpdate(
      studentId,
      update,
      { new: true, runValidators: true }
    ).select('name email branch skills resume placed');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ message: 'Profile updated successfully.', student });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedJobs,
  applyForJob,
  getAppliedJobs,
  updateProfile
};
