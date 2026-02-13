const express = require("express");
const router = express.Router();
const { getAIDataset } = require("../controllers/aiDatasetController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getAIDataset);

module.exports = router;
