const Entreprise = require("../models/entreprise_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Entreprise.find().populate({
      path: "owner",
      select:
        "name,email, mobile, username, sex, password, role, profile_picture, cover_picture,",
    });

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Entreprise.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newEntreprise = new Entreprise(req.body);
    const savedEntreprise = await newEntreprise.save();
    return res.status(201).json(savedEntreprise);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundEntreprise = await Entreprise.findOne({ _id: req.params.id });
    if (!foundEntreprise) {
      return res.status(404).json({ message: "Entreprise non trouvée" });
    }

    const updatedEntreprise = await Entreprise.updateOne(
      { _id: foundEntreprise._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Entreprise mis à jour avec succès",
      updatedData: updatedEntreprise,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundEntreprise = await Entreprise.findOne({ _id: req.params.id });
    if (!foundEntreprise) {
      return res.status(404).json({ error: "Entreprise non trouvée !" });
    }
    const deletedEntreprise = await Entreprise.deleteOne({ _id: foundEntreprise._id });
    return res.json({
      message: "Entreprise supprimé avec succès",
      deletedData: deletedEntreprise,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Entreprise non supprimé !", details: error.message });
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
