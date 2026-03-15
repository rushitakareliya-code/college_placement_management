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
      .select('name email isApproved')
      .sort({ createdAt: -1 });
    res.json(companies);
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
  getPlacementReport
};
