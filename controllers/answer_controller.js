const Answer = require('../models/answer_model');

// Create a new answer
exports.createAnswer = async (req, res) => {
  try {
    const newAnswer = new Answer(req.body);
    const savedAnswer = await newAnswer.save();
    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all answers
exports.getAllAnswers = async (req, res) => {
  try {
    const answers = await Answer.find()
      .populate('coach', 'name')
      .populate('coachee', 'name')
      .populate('evaluation');
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single answer by ID
exports.getAnswerById = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('coach', 'name')
      .populate('coachee', 'name')
      .populate('evaluation');
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an answer
exports.updateAnswer = async (req, res) => {
  try {
    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAnswer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    res.status(200).json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an answer
exports.deleteAnswer = async (req, res) => {
  try {
    const deletedAnswer = await Answer.findByIdAndDelete(req.params.id);
    if (!deletedAnswer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    res.status(200).json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update or create an individual answer within the answers array
exports.updateOrCreateIndividualAnswer = async (req, res) => {
  try {
    const { answerId, idQuestion, score_by_coach, status_by_coach, comment_by_coach } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const individualAnswerIndex = answer.answers.findIndex(a => a._id.toString() === answerId);

    if (individualAnswerIndex > -1) {
      // Update existing individual answer
      answer.answers[individualAnswerIndex] = {
        ...answer.answers[individualAnswerIndex],
        idQuestion,
        score_by_coach,
        status_by_coach,
        comment_by_coach
      };
    } else {
      // Create new individual answer
      answer.answers.push({
        idQuestion,
        score_by_coach,
        status_by_coach,
        comment_by_coach
      });
    }

    const updatedAnswer = await answer.save();
    res.status(200).json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an individual answer from the answers array
exports.deleteIndividualAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.answers = answer.answers.filter(a => a._id.toString() !== answerId);

    const updatedAnswer = await answer.save();
    res.status(200).json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};