const Attachement = require("../models/attachement_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Attachement.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "owner, comment, url",
    // });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Attachement.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Attachement non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Attachement(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Attachement.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Attachement non trouvé" });
    }

    const updatedProject = await Attachement.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Attachement mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Attachement.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Attachement non trouvé !" });
    }
    const deletedProject = await Attachement.findOneAndDelete({ _id: foundCoaching._id });
    return res.json({
      message: "Attachement supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Attachement non supprimé !", details: error.message });
  }
};
