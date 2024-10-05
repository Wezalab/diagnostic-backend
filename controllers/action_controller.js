const Action = require("../models/action_model");

exports.findAll = async (req, res) => {
  try {
    const actions = await Action.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "coachMood, status, goalId, date_limite, description, attachements",
    // });


    return res.status(200).json(actions);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const action = await Action.findOne({ _id: req.params.id });
    if (!action) {
      return res.status(404).json({ message: "Action non trouvé" });
    }

    return res.status(200).json(action);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newAction = new Action(req.body);
    const savedCoaching = await newAction.save();
    return res.status(201).json(savedCoaching);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundAction = await Action.findOne({ _id: req.params.id });
    if (!foundAction) {
      return res.status(404).json({ message: "Action non trouvé" });
    }

    const updatedAction = await Action.findOneAndUpdate(
      { _id: foundAction._id },
      { ...req.body },
      { new: true }
    );
    const actions = await Action.find();

    return res.status(200).json({
      message: "Action mis à jour avec succès",
      updatedData: updatedAction,
      allActions: actions
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundAction = await Action.findOne({ _id: req.params.id });
    if (!foundAction) {
      return res.status(404).json({ error: "Action non trouvé !" });
    }
    const deletedAction = await Action.findOneAndDelete({ _id: foundAction._id });
    return res.json({
      message: "Action supprimé avec succès",
      deletedData: deletedAction,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Action non supprimé !", details: error.message });
  }
};

exports.removeAll = async (req, res) => {
  try {
    await Action.deleteMany({});
    res.status(200).json({ message: "All actions have been deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all actions", error: error.message });
  }
};
