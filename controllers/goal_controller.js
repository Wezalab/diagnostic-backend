const Goal = require("../models/goal_model");

exports.findAll = async (req, res) => {
  try {
    const projects = await Goal.find();
    // .populate({
    //   path: "owner",
    //   select:
    //     "coachMood, status, sessionId, cover, label, date_limite, priority, description, attachements, chat, percentage",
    // });;

    return res.status(200).json(projects);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Goal.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    return res.status(200).json(project);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Create a new goal
    const newGoal = new Goal(req.body);
    const savedGoal = await newGoal.save();

    let allGoal;

    // Check if the role is "COACH" and idCoach exists
    if (req.body.role === "COACH" && req.body.idCoach) {
      allGoal = await Goal.find({ idCoach: req.body.idCoach });
    } 
    // Check if the role is "COACHE" and idCoachee exists
    else if (req.body.role === "COACHE" && req.body.idCoachee && req.body.idCoachee.length > 0) {
      allGoal = await Goal.find({ idCoachee: req.body.idCoachee[0] }); // Assuming you want to filter by the first idCoachee
    } 
    // Default to fetching all goals
    else {
      allGoal = await Goal.find();
    }

    return res.status(201).json({
      createdData: savedGoal,
      allData: allGoal
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundCoaching = await Goal.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    const updatedProject = await Goal.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    const allGoal = await Goal.find();

    return res.status(200).json({
      message: "Objectif mis à jour avec succès",
      updatedData: updatedProject,
      allData : allGoal
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateByCoach = async (req, res) => {
  try {
    // Extract parameters from the request
    const { id, idCoach } = req.params;

    // Verify if the goal exists
    const foundCoaching = await Goal.findOne({ _id: id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    // Update the goal
    const updatedProject = await Goal.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );

    // Retrieve all goals for the specified coach
    const allGoals = await Goal.find({ idCoach }).populate('idCoach').populate('idCoachee').exec();

    // Send the response
    return res.status(200).json({
      message: "Objectif mis à jour avec succès",
      updatedData: updatedProject,
      allData: allGoals,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.updateByCoachee = async (req, res) => {
  try {
    // vérifier si le projet existe
    const { id, idCoachee } = req.params;
    const foundCoaching = await Goal.findOne({ _id: id });
    if (!foundCoaching) {
      return res.status(404).json({ message: "Objectif non trouvé" });
    }

    const updatedProject = await Goal.findOneAndUpdate(
      { _id: foundCoaching._id },
      { ...req.body },
      { new: true }
    );
    const allGoals = await Goal.find({ idCoachee: idCoachee }).populate('idCoach').populate('idCoachee').exec();

    return res.status(200).json({
      message: "Objectif mis à jour avec succès",
      updatedData: updatedProject,
      allData : allGoals
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.remove = async (req, res) => {
  try {
    const foundCoaching = await Goal.findOne({ _id: req.params.id });
    if (!foundCoaching) {
      return res.status(404).json({ error: "Objectif non trouvé !" });
    }

    const deletedProject = await Goal.findOneAndDelete({ _id: foundCoaching._id });

    let allGoal;
    // Check the role from the request (assuming you have access to user role in req)
    const userRole = req.body.role; // Adjust this based on how you pass the role

    // If the role is "COACH", filter by idCoach
    if (userRole === "COACH" && foundCoaching.idCoach) {
      allGoal = await Goal.find({ idCoach: foundCoaching.idCoach });
    } 
    // If the role is "COACHE", filter by idCoachee
    else if (userRole === "COACHE" && foundCoaching.idCoachee.length > 0) {
      allGoal = await Goal.find({ idCoachee: foundCoaching.idCoachee[0] }); // Assuming you want to filter by the first idCoachee
    } 
    // Default to fetching all goals
    else {
      allGoal = await Goal.find();
    }

    return res.json({
      message: "Objectif supprimé avec succès",
      deletedData: deletedProject,
      allData: allGoal
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Objectif non supprimé !", details: error.message });
  }
};

// Controller to list goals by idCoach
exports.listGoalsByCoach = async (req, res) => {
  const { idCoach } = req.params;

  try {
    const goals = await Goal.find({ idCoach }).populate('idCoach').populate('idCoachee').exec();

    if (!goals) {
      return res.status(404).json({ message: 'No goals found for this coach' });
    }

    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Controller to list goals by idCoachee
exports.listGoalsByIdCoachee = async (req, res) => {
  const { idCoachee } = req.params;
  
  try {
    const goals = await Goal.find({ idCoachee: idCoachee }).populate('idCoach').populate('idCoachee').exec();
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving goals', error });
  }
};

exports.removeAll = async (req, res) => {
  try {
    await Goal.deleteMany({});
    res.status(200).json({ message: "All goals have been deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting all goals", error: error.message });
  }
};

exports.deleteGoalByRoleAndUserId = async (req, res) => {
  try {
    const { id, role, userId } = req.params; // Extract goal ID, role, and user ID from request parameters

    // Find the goal by ID
    const foundGoal = await Goal.findOne({ _id: id });
    if (!foundGoal) {
      return res.status(404).json({ error: "Objectif non trouvé !" });
    }

    // Check the role and validate ownership
    if (role === "COACH") {
      // Ensure the goal belongs to the coach
      if (foundGoal.idCoach.toString() !== userId) {
        return res.status(403).json({ error: "Accès refusé !" });
      }
    } else if (role === "COACHE") {
      // Ensure the goal belongs to the coachee
      if (!foundGoal.idCoachee.includes(userId)) {
        return res.status(403).json({ error: "Accès refusé !" });
      }
    } else {
      return res.status(400).json({ error: "Rôle non valide !" });
    }

    // Proceed to delete the goal
    const deletedGoal = await Goal.findOneAndDelete({ _id: foundGoal._id });

    // Logic to fetch all goals based on user role
    let allGoal;
    // If the role is "COACH", filter by idCoach
    if (role === "COACH" && foundGoal.idCoach) {
      allGoal = await Goal.find({ idCoach: foundGoal.idCoach });
    } 
    // If the role is "COACHE", filter by idCoachee
    else if (role === "COACHE" && foundGoal.idCoachee.length > 0) {
      allGoal = await Goal.find({ idCoachee: foundGoal.idCoachee[0] }); // Assuming you want to filter by the first idCoachee
    } 
    // Default to fetching all goals
    else {
      allGoal = await Goal.find();
    }

    return res.json({
      message: "Objectif supprimé avec succès",
      deletedData: deletedGoal,
      allData: allGoal, // Return the updated list of goals
    });
  } catch (error) {
    return res.status(500).json({ error: "Objectif non supprimé !", details: error.message });
  }
};
