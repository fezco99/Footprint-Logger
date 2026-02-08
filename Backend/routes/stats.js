const express = require("express");
const auth = require("../middleware/auth");
const Log = require("../models/Log");
const User = require("../models/User");

const router = express.Router();

// Community average:
router.get("/average", auth, async (req, res) => {
  const logs = await Log.find();
  const total = logs.reduce((sum, l) => sum + l.emission, 0);
  res.json({ average: logs.length ? total / logs.length : 0 });
});

// Leaderboard: lowest footprint users
router.get("/leaderboard", auth, async (_req, res) => {
  const users = await User.find();
  const leaderboard = [];

  for (const user of users) {
    const logs = await Log.find({ user: user._id });
    const total = logs.reduce((sum, l) => sum + l.emission, 0);
    leaderboard.push({ username: user.username, total });
  }

  leaderboard.sort((a, b) => a.total - b.total);
  res.json(leaderboard);
});

module.exports = router;
