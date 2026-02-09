const express = require("express");
const mongoose = require("mongoose");
const Users = require("./models/users");
const authRoutes = require("./routes/auth");
const activities = require("./routes/activities");
const cors = require("cors");
require("dotenv").config()

//mongo url
const uri = process.env.MONGO_URI;

//connect to mongodb database
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("error connecting", err));

const app = express();
const port = 8080;
app.use(express.json());
app.use(cors());

//route to see all users registered
app.get("/", async (req, res) => {
  const users = await Users.find();
  res.send(users);
});

//routes to login and signup
app.use("/auth", authRoutes);

//get activity data
app.use("/activities", activities);

//start server
app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
