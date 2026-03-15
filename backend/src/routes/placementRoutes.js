const express = require('express');
const router = express.Router();
const {
  getAllPlacements,
  createPlacement,
  deletePlacement
} = require('../controllers/placementController');

router.get('/', getAllPlacements);
router.post('/', createPlacement);
router.delete('/:id', deletePlacement);

module.exports = router;
