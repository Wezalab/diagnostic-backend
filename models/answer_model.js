const mongoose = require("mongoose");

const answersSchema = mongoose.Schema({
  idQuestion: { type: mongoose.Schema.Types.ObjectId },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["En attente", "Necessite Changement", "Refusé", "Approuvé"],
    default: "En attente",
  },
  comment_by_coach: { type: String },
});

const answerSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
  coachee: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coachee
  date: { type: Date, default: Date.now },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["En attente", "Necessite Changement", "Refusé", "Approuvé"],
    default: "En attente",
  },
  evaluation: { type: mongoose.Schema.Types.ObjectId, ref: "Evaluation" },
  answers: { type: [answersSchema], default: [] }
});

const Answer = mongoose.model("Answer", answerSchema);
module.exports = Answer;
