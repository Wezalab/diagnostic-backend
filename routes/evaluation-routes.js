const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  eval,
  editquestion,
  editanswer,
} = require("../controllers/evaluation_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:evaluationId/facteur/:facteurId/question/:questionId", editquestion);
router.post("/:evaluationId/facteur/:facteurId/question/:questionId/eval", eval);
router.put("/:evaluationId/facteur/:facteurId/question/:questionId/eval/:evalId", editanswer );


module.exports = router;
