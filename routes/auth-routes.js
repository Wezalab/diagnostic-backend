const router = require("express").Router();
const {
  signup,
  login,
  resetPassword,
  profile,
  findAll,
  handleResetPassword,
  centralAchatAuth,
  resetPasswordByCode,
  handleResetPasswordNoToken,
  update,
  loginGoogle
} = require("../controllers/auth-controller");

router.post("/signup", signup);
router.post("/login", login);
router.post("/login-google", loginGoogle);

router.post("/reset-password", resetPassword);
router.post("/reset-password-code", resetPasswordByCode);
router.post("/reset-password/:userId/:resetToken", handleResetPassword);
router.post("/reset-password-no-token/:userId/", handleResetPasswordNoToken);

router.get("/profile", profile);
router.get("/user-list", findAll);
router.post("/central-achat", centralAchatAuth );
router.put("/update/:userId", update );

module.exports = router;
