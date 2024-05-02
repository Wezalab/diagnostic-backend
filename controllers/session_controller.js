const Session = require("../models/session_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Session.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "idCoach, status, idCoachee",
    // });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Session.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Session non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Session(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Session.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Session non trouvé" });
    }

    const updatedProject = await Session.updateOne(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Session mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Session.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Session non trouvé !" });
    }
    const deletedProject = await Session.deleteOne({ _id: foundCoaching._id });
    return res.json({
      message: "Session supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Session non supprimé !", details: error.message });
  }
};
