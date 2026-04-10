const Placement = require('../models/Placement');
const Student = require('../models/Student');
const Company = require('../models/Company');

const getAllPlacements = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.studentId) {
      filter.student = req.query.studentId;
    }

    const placements = await Placement.find(filter)
      .populate('student')
      .populate('company')
      .populate('job')
      .sort({ createdAt: -1 });
    res.json(placements);
  } catch (error) {
    next(error);
  }
};

const createPlacement = async (req, res, next) => {
  try {
    const { student, company } = req.body;
    const studentExists = await Student.findById(student);
    const companyExists = await Company.findById(company);
    if (!studentExists) return res.status(404).json({ message: 'Student not found' });
    if (!companyExists) return res.status(404).json({ message: 'Company not found' });
    const placement = await Placement.create({ student, company });
    const populated = await Placement.findById(placement._id).populate('student').populate('company');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const deletePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);
    if (!placement) return res.status(404).json({ message: 'Placement not found' });
    res.json({ message: 'Placement record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePlacementStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await Placement.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('student')
      .populate('company')
      .populate('job');

    if (!updated) {
      return res.status(404).json({ message: 'Placement not found' });
    }

    // Also update the job's applicants array status
    if (updated.job && updated.job._id) {
      const Job = require('../models/Job');
      await Job.updateOne(
        { _id: updated.job._id, "applicants.student": updated.student._id },
        { $set: { "applicants.$.status": status } }
      );
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlacements,
  createPlacement,
  deletePlacement,
  updatePlacementStatus
};
