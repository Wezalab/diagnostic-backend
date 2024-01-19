const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  recommend,
  completeRecommend,
  updatelogo,
  updatecover
} = require("../controllers/project_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

router.post("/:id", recommend);
router.post("/:id", completeRecommend);

router.put("/:id", updatelogo);
router.put("/cover/:id", updatecover);

module.exports = router;
