const mongoose = require("mongoose");

const chat = mongoose.Schema({
  message: { type: String },
  date: { type: Date, default: Date.now() },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attachements: { type: [String] },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const actionSchema = new mongoose.Schema({
  coachMood: {type: String},
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED", "PENDING"],
    default: "PENDING",
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
  },
  date_limite: { type: Date },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW",
  },
  description: {type: String},
  attachements : {type: [String]},
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status_by_coach: {
    type: String,
    enum: ["En attente", "Necessite Changement", "Refusé", "Approuvé"],
    default: "En attente",
  },
  chat: { type: [chat] },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() }
});

const Action = mongoose.model("Action", actionSchema);
module.exports = Action;
