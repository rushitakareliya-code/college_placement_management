const Placement = require('../models/Placement');
const Student = require('../models/Student');
const Company = require('../models/Company');

const getAllPlacements = async (req, res, next) => {
  try {
    const placements = await Placement.find()
      .populate('student')
      .populate('company')
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

module.exports = {
  getAllPlacements,
  createPlacement,
  deletePlacement
};
