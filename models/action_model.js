const mongoose = require("mongoose");

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
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() }

});

const Action = mongoose.model("Action", actionSchema);
module.exports = Action;
