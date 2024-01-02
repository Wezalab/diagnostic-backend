const router = require("express").Router();
const {
  signup,
  login,
  resetPassword,
  profile,
  findAll,
} = require("../controllers/auth-controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/profile", profile);
router.get("/user-list", findAll);

module.exports = router;
