const Goal = require("../models/goal_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Goal.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "coachMood, status, sessionId, cover, label, date_limite, priority, description, attachements, chat, percentage",
    // });;

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Goal.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Goal(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Goal.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    const updatedProject = await Goal.updateOne(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Objectif mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Goal.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Objectif non trouvé !" });
    }
    const deletedProject = await Goal.deleteOne({ _id: foundCoaching._id });
    return res.json({
      message: "Objectif supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Objectif non supprimé !", details: error.message });
  }
};
