const mongoose = require("mongoose");

const chat = mongoose.Schema({
  message: { type: String },
  date: { type: Date, default: Date.now() },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attachements: { type: [String] },
});

const goalSchema = new mongoose.Schema({
  name: { type: String },
  coachMood: { type: String },
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED", "PENDING"],
    default: "PENDING",
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: false, // Making sessionId optional
  },
  cover: { type: String },
  label: { type: [String] },
  date_limite: { type: Date },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW",
  },
  description: { type: String },
  attachements: { type: [String] },
  chat: { type: [chat] },
  percentage: { type: Number },
  column: { type: Number, default: 0 },
});

const Goal = mongoose.model("Goal", goalSchema);
module.exports = Goal;
