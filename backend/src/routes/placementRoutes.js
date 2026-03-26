const express = require('express');
const router = express.Router();
const {
  getAllPlacements,
  createPlacement,
  deletePlacement,
  updatePlacementStatus
} = require('../controllers/placementController');

router.get('/', getAllPlacements);
router.post('/', createPlacement);
router.put('/:id/status', updatePlacementStatus);
router.delete('/:id', deletePlacement);

module.exports = router;
