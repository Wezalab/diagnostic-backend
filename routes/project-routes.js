const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  recommend,
  completeRecommend,
} = require("../controllers/project-controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

router.post("/:id", recommend);
router.post("/:id", completeRecommend);

module.exports = router;
