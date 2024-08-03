const mongoose = require("mongoose");

const evaSchema = mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
  coachee: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coachee
  date: { type: Date, default: Date.now },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["En attente", "Necessite Changement", "Refusé", "Approuvé"],
  },
});

const facteurSchema = mongoose.Schema({
  nomFacteur: { type: String },
  questions: [{
    question: { type: String },
    recommandations: { type: [String] },
    evaluations: { type: [evaSchema], default: [] },
  }],
});

const evaluationSchema = new mongoose.Schema({
  questionHeader: { type: String, required: true, trim: true },
  facteur: { type: [facteurSchema], default: [] },
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
module.exports = Evaluation;
