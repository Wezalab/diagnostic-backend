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
