const router = require("express").Router();
const protect = require("../middleware/auth");
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  duplicate,
} = require("../controllers/bmc-controller");

router.use(protect);

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:id/duplicate", duplicate);

module.exports = router;
