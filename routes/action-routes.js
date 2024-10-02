const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  removeAll
} = require("../controllers/action_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.delete("/", removeAll);

module.exports = router;
