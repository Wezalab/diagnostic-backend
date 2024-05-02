const Coaching = require("../models/coaching_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Coaching.find().exec();

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Coaching.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Coaching non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newCoaching = new Coaching(req.body);
    const savedCoaching = await newCoaching.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Coaching.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Coaching non trouvé" });
    }

    const updatedProject = await Coaching.updateOne(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Coaching mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Coaching.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Coaching non trouvé !" });
    }
    const deletedProject = await Coaching.deleteOne({ _id: foundCoaching._id });
    return res.json({
      message: "Coaching supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Coaching non supprimé !", details: error.message });
  }
};
