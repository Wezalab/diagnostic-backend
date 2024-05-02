const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
} = require("../controllers/session_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
