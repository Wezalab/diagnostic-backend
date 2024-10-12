const router = require("express").Router();
const {
  findAll,
  getOne,
  create,
  update,
  remove,
  getSessionsNotInAnyInvoice,
  fetchSessionsByCoacheeId,
  fetchSessionsByCoachId
} = require("../controllers/session_controller");

router.get("/", findAll);
router.get("/:id", getOne);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

// Get sessions not in any invoice
router.get('/not-in-invoice', getSessionsNotInAnyInvoice);

// Route to fetch sessions by coacheeId
router.get("/coachee/:coacheeId", fetchSessionsByCoacheeId);

router.get("/sessions/coach/:coachId", fetchSessionsByCoachId);



module.exports = router;
