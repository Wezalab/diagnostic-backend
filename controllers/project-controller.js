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
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
exports.create = async (req, res) => {
  try {
    // code here
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    return res.status(201).json(savedProject);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    // check if the project exists
    const foundProject = await Project.findOne({ _id: req.params.id });
    if (!foundProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = await Project.updateOne(
      { _id: foundProject._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Project updated successfully",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
exports.remove = async (req, res) => {
  try {
    // code here
    const foundProject = await Project.findOne({ _id: req.params.id });
    if (!foundProject) {
      return res.status(404).json({ error: "Project not found!" });
    }
    const deletedProject = await Project.deleteOne({ _id: foundProject._id });
    return res.json({
      message: "Project deleted successfully",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Product not deleted!", details: error.message });
  }
};

exports.recommend = async (req, res) => {
  try {
    // coming soon
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
exports.completeRecommend = async (req, res) => {
  try {
    // coming soon
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
