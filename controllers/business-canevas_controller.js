const BusinessCan = require("../models/business-canevas_model");

exports.findAll = async (req, res) => {
  try {
    const businesscanevas = await BusinessCan.find().populate({
      path: "owner",
      select:
        "name,email, mobile, username, sex, password, role, profile_picture, cover_picture,",
    });

    return res.status(200).json(businesscanevas);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const businessCaneva = await BusinessCan.findOne({ _id: req.params.id });
    if (!businessCaneva) {
      return res.status(404).json({ message: "Business Canevas non trouvé" });
    }

    return res.status(200).json(businessCaneva);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newBusinessCaneva = new BusinessCan(req.body);
    const savedBusinessCaneva = await newBusinessCaneva.save();
    return res.status(201).json(savedBusinessCaneva);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundBusinessCaneva = await BusinessCan.findOne({
      _id: req.params.id,
    });
    if (!foundBusinessCaneva) {
      return res.status(404).json({ message: "Business Canevas non trouvé" });
    }

    const updatedBusinessCan = await BusinessCan.updateOne(
      { _id: foundBusinessCaneva._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Business Canevas mis à jour avec succès",
      updatedData: updatedBusinessCan,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundBusinessCaneva = await BusinessCan.findOne({
      _id: req.params.id,
    });
    if (!foundBusinessCaneva) {
      return res.status(404).json({ error: "Business Canevas non trouvé !" });
    }
    const deletedBusinessCan = await BusinessCan.deleteOne({
      _id: foundBusinessCaneva._id,
    });
    return res.json({
      message: "Business Canevas supprimé avec succès",
      deletedData: deletedBusinessCan,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Business Canevas non supprimé !",
      details: error.message,
    });
  }
};
