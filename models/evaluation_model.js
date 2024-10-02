const mongoose = require("mongoose");

const facteurSchema = mongoose.Schema({
  nomFacteur: { type: String },
  questions: [{
    question: { type: String },
    recommandations: { type: [String] },
  }],
});

const evaluationSchema = new mongoose.Schema({
  questionHeader: { type: String, required: true, trim: true },
  facteur: { type: [facteurSchema], default: [] },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
module.exports = Evaluation;
