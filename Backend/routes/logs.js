const express = require("express");
const auth = require("../middleware/auth");
const Log = require("../models/Log");

const router = express.Router();

// Get user's logs
router.get("/", auth, async (req, res) => {
  const logs = await Log.find({ user: req.user.id });
  res.json(logs);
});

// Add log
router.post("/", auth, async (req, res) => {
  const { activity, emission } = req.body;
  const newLog = new Log({ user: req.user.id, activity, emission });
  await newLog.save();
  res.json(newLog);
});

module.exports = router;
