const Evaluation = require("../models/evaluation_model");

exports.findAll = async (req, res) => {
  try {
    const evaluations = await Evaluation.find();
    return res.status(200).json(evaluations);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation non trouvée" });
    }

    return res.status(200).json(evaluation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    // code ici
    const newEvaluation = new Evaluation(req.body);
    const savedEvaluation = await newEvaluation.save();
    return res.status(201).json(savedEvaluation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


exports.update = async (req, res) => {
  try {
    // vérifier si le projet existe
    const foundEvaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!foundEvaluation) {
      return res.status(404).json({ message: "Evaluation non trouvée" });
    }

    const updatedEvaluation = await Evaluation.findOneAndUpdate(
      { _id: foundEvaluation._id },
      { ...req.body },
      { new: true }
    );

    return res.status(200).json({
      message: "Evaluation mise à jour avec succès",
      updatedData: updatedEvaluation,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    // code ici
    const foundEvaluation = await Evaluation.findOne({ _id: req.params.id });
    if (!foundEvaluation) {
      return res.status(404).json({ error: "Evaluation non trouvée !" });
    }
    const deletedProject = await Evaluation.findOneAndDelete({ _id: foundEvaluation._id });
    return res.json({
      message: "Evaluation supprimée avec succès",
      deletedData: deletedProject,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Evaluation non supprimée !", details: error.message });
  }
};

exports.eval = async (req, res) => {
  try {
    const { evaluationId, facteurId, questionId } = req.params;
    const { coach, coachee, score_by_coach, status_by_coach } = req.body;
    console.log("ok");

    // Find the evaluation by ID
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Find the specific facteur
    const facteur = evaluation.facteur.id(facteurId);

    if (!facteur) {
      return res.status(404).json({ message: "Facteur not found" });
    }

    // Find the specific question
    const question = facteur.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create the new evaluation
    const newEvaluation = {
      coach,
      coachee,
      score_by_coach,
      status_by_coach,
    };

    // Push the new evaluation to the evaluations array
    question.evaluations.push(newEvaluation);

    // Save the updated evaluation document
    await evaluation.save();

    res.status(200).json({ message: "Evaluation added successfully", evaluation });
  } catch (error) {
    console.log("Error", error);

    res.status(500).json({ message: "Error adding evaluation", error });
  }
};

exports.evalMultiple = async (req, res) => {
  try {
    const { evaluations } = req.body; // Expecting an array of evaluations

    if (!evaluations || evaluations.length === 0) {
      return res.status(400).json({ message: "No evaluations provided" });
    }

    // Loop through each evaluation in the array
    for (let evalData of evaluations) {
      const { evaluationId, facteurId, questionId, coach, coachee, score_by_coach, status_by_coach } = evalData;

      // Find the evaluation by ID
      const evaluation = await Evaluation.findById(evaluationId);

      if (!evaluation) {
        return res.status(404).json({ message: `Evaluation not found for ID: ${evaluationId}` });
      }

      // Find the specific facteur
      const facteur = evaluation.facteur.id(facteurId);

      if (!facteur) {
        return res.status(404).json({ message: `Facteur not found for ID: ${facteurId}` });
      }

      // Find the specific question
      const question = facteur.questions.id(questionId);

      if (!question) {
        return res.status(404).json({ message: `Question not found for ID: ${questionId}` });
      }

      // Create the new evaluation
      const newEvaluation = {
        coach,
        coachee,
        score_by_coach,
        status_by_coach,
      };

      // Push the new evaluation to the evaluations array of the question
      question.evaluations.push(newEvaluation);

      // Save the updated evaluation document
      await evaluation.save();
    }

    // If all evaluations were saved successfully
    res.status(200).json({ message: "All evaluations added successfully" });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Error adding evaluations", error });
  }
};



// Route to edit a question
exports.editquestion = async (req, res) => {
  try {
    const { evaluationId, facteurId, questionId } = req.params;
    const { question, recommandations } = req.body;

    // Find the evaluation by ID
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Find the specific facteur
    const facteur = evaluation.facteur.id(facteurId);

    if (!facteur) {
      return res.status(404).json({ message: "Facteur not found" });
    }

    // Find the specific question
    const existingQuestion = facteur.questions.id(questionId);

    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the question and recommandations if provided
    if (question) {
      existingQuestion.question = question;
    }

    if (recommandations) {
      existingQuestion.recommandations = recommandations;
    }

    // Save the updated evaluation document
    await evaluation.save();

    res.status(200).json({ message: "Question updated successfully", evaluation });
  } catch (error) {
    res.status(500).json({ message: "Error updating question", error });
  }
};

exports.editanswer = async (req, res) => {
  try {
    const { evaluationId, facteurId, questionId, evalId } = req.params;
    const { coach, coachee, score_by_coach, status_by_coach } = req.body;

    // Find the evaluation by ID
    const evaluation = await Evaluation.findById(evaluationId);

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Find the specific facteur
    const facteur = evaluation.facteur.id(facteurId);

    if (!facteur) {
      return res.status(404).json({ message: "Facteur not found" });
    }

    // Find the specific question
    const question = facteur.questions.id(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find the specific evaluation
    const existingEval = question.evaluations.id(evalId);
    console.log(evalId);

    if (!existingEval) {
      return res.status(404).json({ message: "This answer not found" });
    }

    // Update the evaluation fields if provided
    if (coach) existingEval.coach = coach;
    if (coachee) existingEval.coachee = coachee;
    if (score_by_coach !== undefined) existingEval.score_by_coach = score_by_coach;
    if (status_by_coach) existingEval.status_by_coach = status_by_coach;

    // Save the updated evaluation document
    await evaluation.save();

    res.status(200).json({ message: "Evaluation updated successfully", evaluation });
  } catch (error) {
    res.status(500).json({ message: "Error updating evaluation", error });
  }
};