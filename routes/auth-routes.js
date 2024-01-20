const router = require("express").Router();
const {
  signup,
  login,
  resetPassword,
  profile,
  findAll,
  handleResetPassword,
  centralAchatAuth,
} = require("../controllers/auth-controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/reset-password/:userId/:resetToken", handleResetPassword);
router.get("/profile", profile);
router.get("/user-list", findAll);
router.post("/central-achat", centralAchatAuth );

module.exports = router;
