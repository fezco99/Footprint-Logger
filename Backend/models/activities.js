const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  recentActivities: Array,
  customAct: Array,
});

const Activities = mongoose.model("Activities", activitiesSchema);

module.exports = Activities;
