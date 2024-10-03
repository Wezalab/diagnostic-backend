const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  listGoalsByCoach,
  listGoalsByIdCoachee,
  updateByCoach,
  updateByCoachee,
  removeAll,
  deleteGoalByRoleAndUserId // Add this new controller function
} = require("../controllers/goal_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.get("/coach/:idCoach", listGoalsByCoach);
router.get("/coachee/:idCoachee", listGoalsByIdCoachee);
router.post("/", create);
router.put("/:id", update);
router.put("/coach/:id/:idCoach", updateByCoach);
router.put("/coachee/:id/:idCoachee", updateByCoachee);
router.delete("/:id", remove);
router.delete("/", removeAll);
router.delete("/role/:role/userId/:userId/id/:id", deleteGoalByRoleAndUserId); // New route for deleting by role and user ID

module.exports = router;
