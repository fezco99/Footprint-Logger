const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Users = require("../models/users");
const Activities = require("../models/activities");
const auth = require("../middleware/auth");
require("dotenv").config()

const jwtKey = process.env.JWT_SECRET;

//route to register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //check if the user already exists
    const users = await Users.find({
      $or: [{ username: username }, { email: email }],
    });

    if (users.length > 0) {
      return res.status(400).json({ message: "user already exists" });
    }

    const newUser = new Users({
      username: username,
      email: email,
      password: password,
    });
    await newUser.save();

    await Activities.create({
      userId: newUser._id,
      total: 0,
      recentActivities: [],
      customAct: [],
    });

    res.status(201).json({ message: "new user created" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

//route to login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email: email, password: password });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const token = jwt.sign({ userid: user._id, email: user.email }, jwtKey);

    res.status(200).json({ username: user.username, token: token });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    const userId = req.user.userid;

    const user = await Users.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "user not found" });

    await Activities.findOneAndDelete({ userId });

    res.json({ message: "user deleted" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
