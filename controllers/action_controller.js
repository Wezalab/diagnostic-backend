const Action = require("../models/action_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Action.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "coachMood, status, goalId, date_limite, description, attachements",
    // });


    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Action.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Action non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Action(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Action.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Action non trouvé" });
    }

    const updatedProject = await Action.updateOne(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Action mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Action.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Action non trouvé !" });
    }
    const deletedProject = await Action.deleteOne({ _id: foundCoaching._id });
    return res.json({
      message: "Action supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Action non supprimé !", details: error.message });
  }
};
