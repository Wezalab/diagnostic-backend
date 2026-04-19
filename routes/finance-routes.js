const router = require("express").Router();
const protect = require("../middleware/auth");
const { getByVenture, create, update, remove } = require("../controllers/finance-controller");

router.use(protect);

router.get("/", getByVenture);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
