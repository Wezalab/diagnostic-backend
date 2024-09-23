const Coaching = require("../models/coaching_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Coaching.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "autre, status, coach, coache",
    // });
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Coaching.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Coaching not found" });
    }
    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const newCoaching = new Coaching(req.body);
    const savedCoaching = await newCoaching.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const foundCoaching = await Coaching.findById(req.params.id);
    if (!foundCoaching) {
      return res.status(404).json({ message: "Coaching not found" });
    }
    const updatedProject = await Coaching.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Coaching updated successfully",
      updatedData: updatedProject,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const foundCoaching = await Coaching.findById(req.params.id);
    if (!foundCoaching) {
      return res.status(404).json({ error: "Coaching not found" });
    }
    const deletedCoaching = await Coaching.findByIdAndDelete(req.params.id);
    return res.json({
      message: "Coaching deleted successfully",
      deletedData: deletedCoaching,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Coaching not deleted", details: error.message });
  }
};
