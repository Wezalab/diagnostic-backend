const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  coachMood: {type: String},
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED"],
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

});

const Action = mongoose.model("Action", actionSchema);
module.exports = Action;
