const Evaluation = require("../models/evaluation_model");

exports.findAll = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    return res.status(200).json(evaluations);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation non trouvée" });
    }

    return res.status(200).json(evaluation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newEvaluation = new Evaluation(req.body);
    const savedEvaluation = await newEvaluation.save();
    return res.status(201).json(savedEvaluation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundEvaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!foundEvaluation) {
      return res.status(404).json({ message: "Evaluation non trouvée" });
    }

    const updatedEvaluation = await Evaluation.findOneAndUpdate(
      { _id: foundEvaluation._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Evaluation mise à jour avec succès",
      updatedData: updatedEvaluation,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundEvaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!foundEvaluation) {
      return res.status(404).json({ error: "Evaluation non trouvée !" });
    }
    const deletedProject = await Evaluation.findOneAndDelete({ _id: foundEvaluation._id });
    return res.json({
      message: "Evaluation supprimée avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Evaluation non supprimée !", details: error.message });
  }
};

exports.eval = async (req, res) => {
  try {
    const { evaluationId, facteurId, questionId } = req.params;
    const { coach, coachee, score_by_coach, status_by_coach } = req.body;
    console.log("ok");

    // Find the evaluation by ID
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Find the specific facteur
    const facteur = evaluation.facteur.id(facteurId);

    if (!facteur) {
      return res.status(404).json({ message: "Facteur not found" });
    }

    // Find the specific question
    const question = facteur.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create the new evaluation
    const newEvaluation = {
      coach,
      coachee,
      score_by_coach,
      status_by_coach,
    };

    // Push the new evaluation to the evaluations array
    question.evaluations.push(newEvaluation);

    // Save the updated evaluation document
    await evaluation.save();

    res.status(200).json({ message: "Evaluation added successfully", evaluation });
  } catch (error) {
    res.status(500).json({ message: "Error adding evaluation", error });
  }
};
