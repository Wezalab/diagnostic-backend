const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  listGoalsByCoach,
  listGoalsByIdCoachee,
  updateByCoach
} = require("../controllers/goal_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.get("/coach/:idCoach", listGoalsByCoach);
router.get("/coachee/:idCoachee", listGoalsByIdCoachee);
router.post("/", create);
router.put("/:id", update);
router.put("/coach/:id", updateByCoach);
router.delete("/:id", remove);

module.exports = router;
