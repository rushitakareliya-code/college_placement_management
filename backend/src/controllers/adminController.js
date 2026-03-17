const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');

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
      .populate('company', 'name')
      .select('title applicants')
      .lean();
    const placementByStudent = {};
    jobs.forEach(job => {
      const companyName = job.company ? job.company.name : null;
      (job.applicants || []).forEach(a => {
        if (a.status === 'Selected' && a.student) {
          const sid = a.student.toString();
          if (!placementByStudent[sid]) placementByStudent[sid] = [];
          placementByStudent[sid].push({ companyName, jobTitle: job.title });
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
  approveOrBlockCompany,
  getPlacementReport,
  addCompany,
  updateCompany,
  deleteCompany,
};
