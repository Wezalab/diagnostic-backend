const mongoose = require("mongoose");

const chat = mongoose.Schema({
  message: { type: String },
  date: { type: Date, default: Date.now() },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attachements : {type: [String]},
});

const coachingSchema = new mongoose.Schema({
  coachMood: {type: String},
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED"],
    default: "PENDING",
  },
  coachingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coaching",
  },
  cover: {type: String},
  label: {type: [String]},
  date_limite: { type: Date },

  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW",
  },
  description: {type: String},
  attachements : {type: [String]},
  chat: { type: [chat] },

});

const Coaching = mongoose.model("Coaching", coachingSchema);
module.exports = Coaching;
