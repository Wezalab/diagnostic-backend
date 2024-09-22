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
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
module.exports = Evaluation;
