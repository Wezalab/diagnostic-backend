const Social = require("../models/social_media_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Social.find().populate({
      path: "owner",
      select:
        "owner, socialMedia, url",
    });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Social.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Social non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newSession = new Social(req.body);
    const savedCoaching = await newSession.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Social.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Social non trouvé" });
    }

    const updatedProject = await Social.updateOne(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Social mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundCoaching = await Social.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Social non trouvé !" });
    }
    const deletedProject = await Social.deleteOne({ _id: foundCoaching._id });
    return res.json({
      message: "Social supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Social non supprimé !", details: error.message });
  }
};
