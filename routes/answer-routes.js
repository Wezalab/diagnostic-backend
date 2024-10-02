const router = require("express").Router();

const { 
  createAnswer, 
  getAllAnswers, 
  getAnswerById, 
  updateAnswer, 
  deleteAnswer, 
  updateOrCreateIndividualAnswer, 
  deleteIndividualAnswer,
  removeAll
} = require("../controllers/answer_controller");


router.post('/', createAnswer);
router.get('/', getAllAnswers);
router.get('/:id', getAnswerById);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer);
router.put('/:id/individual-answer', updateOrCreateIndividualAnswer);
router.delete('/:id/individual-answer/:answerId', deleteIndividualAnswer);
router.delete("/", removeAll);

module.exports = router;
