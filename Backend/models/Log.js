const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activity: { type: String, required: true },
  emission: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Log", LogSchema);
