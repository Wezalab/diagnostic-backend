const Project = require("../models/project_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Project.find().exec();
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    return res.status(201).json(savedProject);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundProject = await Project.findOne({ _id: req.params.id });
    if (!foundProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }

    const updatedProject = await Project.updateOne(
      { _id: foundProject._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Projet mis à jour avec succès",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundProject = await Project.findOne({ _id: req.params.id });
    if (!foundProject) {
      return res.status(404).json({ error: "Projet non trouvé !" });
    }
    const deletedProject = await Project.deleteOne({ _id: foundProject._id });
    return res.json({
      message: "Projet supprimé avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Projet non supprimé !", details: error.message });
  }
};

exports.recommend = async (req, res) => {
  try {
    // bientôt disponible
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.completeRecommend = async (req, res) => {
  try {
    // bientôt disponible
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
