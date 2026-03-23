const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Notice = require('../models/Notice');

const toAttachmentUrl = (req, file) => `/uploads/notices/${file.filename}`;

const parseExistingAttachments = (rawValue) => {
  if (!rawValue) return [];
  if (Array.isArray(rawValue)) return rawValue.filter(Boolean);
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
};

// View all students (name, email, branch, placed)
const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find()
      .select('name email branch placed')
      .sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// View all companies (name, email, approval status)
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

const addCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      companyPassword,
      companyPhone,
      companyDescription,
      companyWebsite,
      companyLocation,
      companyDifficulty
    } = req.body;

    // ✅ 1. Required field check
    if (!companyName || !companyEmail || !companyPassword) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // ✅ 2. Check duplicate email
    const existing = await Company.findOne({ companyEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // ✅ 3. Create company
    const company = new Company({
      companyName,
      companyEmail,
      companyPassword,
      companyPhone: String(companyPhone), // 🔥 fix type issue
      companyDescription,
      companyWebsite,
      companyLocation,
      companyDifficulty
    });

    const savedCompany = await company.save();

    res.status(201).json(savedCompany);

  } catch (error) {
    console.log('REQ BODY:', req.body);
    console.error('Add company failed:', error);

    res.status(500).json({
      message: error.message || 'Server error'
    });
  }
};



const updateCompany = async (req, res) => {
  try {

    const id = req.params.companyId;

    // 🔥 Remove password if empty
    if (!req.body.companyPassword) {
      delete req.body.companyPassword;
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updatedCompany);

  } catch (error) {
    console.error('UPDATE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const id = req.params.companyId;

    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });

  } catch (error) {
    console.error('DELETE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

const parseStringArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// View all jobs
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('companyId', 'companyName companyEmail')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// Add new job
const addJob = async (req, res, next) => {
  try {
    const {
      role,
      location,
      type,
      experience,
      salary,
      workingDays,
      weekOff,
      shift,
      description,
      responsibilities,
      requirements,
      companyId,
    } = req.body;

    if (!role || !companyId || !description) {
      return res.status(400).json({
        message: 'Role, company, and description are required.',
      });
    }

    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    const companyName =
      typeof companyExists.companyName === 'string'
        ? companyExists.companyName
        : '';

    const job = await Job.create({
      role: String(role).trim(),
      company: companyName,
      location: String(location || '').trim() || '—',
      type: String(type || '').trim() || '—',
      experience: String(experience || '').trim() || '—',
      salary: String(salary || '').trim() || '—',
      workingDays: String(workingDays || '').trim() || '—',
      weekOff: String(weekOff || '').trim() || '—',
      shift: String(shift || '').trim() || '—',
      description: String(description).trim(),
      responsibilities: parseStringArray(responsibilities),
      requirements: parseStringArray(requirements),
      companyId,
    });

    const populatedJob = await Job.findById(job._id).populate(
      'companyId',
      'companyName companyEmail'
    );
    res.status(201).json(populatedJob);
  } catch (error) {
    next(error);
  }
};

// Update existing job
const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const {
      role,
      location,
      type,
      experience,
      salary,
      workingDays,
      weekOff,
      shift,
      description,
      responsibilities,
      requirements,
      companyId,
    } = req.body;

    if (!role || !companyId || !description) {
      return res.status(400).json({
        message: 'Role, company, and description are required.',
      });
    }

    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    const companyName =
      typeof companyExists.companyName === 'string'
        ? companyExists.companyName
        : '';

    const updated = await Job.findByIdAndUpdate(
      jobId,
      {
        role: String(role).trim(),
        company: companyName,
        location: String(location || '').trim() || '—',
        type: String(type || '').trim() || '—',
        experience: String(experience || '').trim() || '—',
        salary: String(salary || '').trim() || '—',
        workingDays: String(workingDays || '').trim() || '—',
        weekOff: String(weekOff || '').trim() || '—',
        shift: String(shift || '').trim() || '—',
        description: String(description).trim(),
        responsibilities: parseStringArray(responsibilities),
        requirements: parseStringArray(requirements),
        companyId,
      },
      { new: true, runValidators: true }
    ).populate('companyId', 'companyName companyEmail');

    if (!updated) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete job
const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const deleted = await Job.findByIdAndDelete(jobId);
    if (!deleted) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    res.json({ message: 'Job deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// View all notices
const getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    next(error);
  }
};

// Add notice
const addNotice = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const uploadedAttachments = Array.isArray(req.files)
      ? req.files.map((file) => toAttachmentUrl(req, file))
      : [];

    const notice = await Notice.create({
      title: title.trim(),
      message: message.trim(),
      attachments: uploadedAttachments
    });

    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

// Update notice
const updateNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const { title, message, existingAttachments } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const newUploadedAttachments = Array.isArray(req.files)
      ? req.files.map((file) => toAttachmentUrl(req, file))
      : [];
    const keptAttachments = parseExistingAttachments(existingAttachments);
    const finalAttachments = newUploadedAttachments.length > 0
      ? newUploadedAttachments
      : keptAttachments;

    const updatedNotice = await Notice.findByIdAndUpdate(
      noticeId,
      {
        title: title.trim(),
        message: message.trim(),
        attachments: finalAttachments
      },
      { new: true, runValidators: true }
    );

    if (!updatedNotice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    res.json(updatedNotice);
  } catch (error) {
    next(error);
  }
};

// Delete notice
const deleteNotice = async (req, res, next) => {
  try {
    const { noticeId } = req.params;
    const deletedNotice = await Notice.findByIdAndDelete(noticeId);

    if (!deletedNotice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    next(error);
  }
};


// Approve or block company (update isApproved)
const approveOrBlockCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'isApproved must be true or false.' });
    }
    const company = await Company.findByIdAndUpdate(
      companyId,
      { isApproved },
      { new: true, runValidators: true }
    ).select('name email isApproved');
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json({
      message: isApproved ? 'Company approved.' : 'Company blocked.',
      company
    });
  } catch (error) {
    next(error);
  }
};

// Placement report: students with placed=true, include company name and job title if possible
const getPlacementReport = async (req, res, next) => {
  try {
    const students = await Student.find({ placed: true })
      .select('name email branch placed')
      .lean();
    const jobs = await Job.find({ 'applicants.status': 'Selected' })
      .populate('companyId', 'companyName')
      .select('role applicants')
      .lean();
    const placementByStudent = {};
    jobs.forEach(job => {
      const companyName = job.companyId ? job.companyId.companyName : null;
      (job.applicants || []).forEach(a => {
        if (a.status === 'Selected' && a.student) {
          const sid = a.student.toString();
          if (!placementByStudent[sid]) placementByStudent[sid] = [];
          placementByStudent[sid].push({ companyName, jobTitle: job.role });
        }
      });
    });
    const report = students.map(s => {
      const id = s._id.toString();
      const placement = placementByStudent[id];
      return {
        name: s.name,
        email: s.email,
        branch: s.branch,
        placed: s.placed,
        companyName: placement && placement[0] ? placement[0].companyName : null,
        jobTitle: placement && placement[0] ? placement[0].jobTitle : null
      };
    });
    res.json(report);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getAllCompanies,
  getAllJobs,
  addJob,
  updateJob,
  deleteJob,
  getAllNotices,
  addNotice,
  updateNotice,
  deleteNotice,
  approveOrBlockCompany,
  getPlacementReport,
  addCompany,
  updateCompany,
  deleteCompany,
};
