const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  applyForJob
} = require('../controllers/jobController');

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/apply', applyForJob);

module.exports = router;
