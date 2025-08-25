const router = require("express").Router();
const {
  createCoachingRequest,
  updateCoachingRequestStatus,
  reRequestCoaching,
  cancelCoachingRequest,
  getCoachRequests,
  getCoacheeRequests,
  getAllCoachingRequests,
  getCoachingRequestById
} = require("../controllers/coaching_request_controller");

// Create a new coaching request
router.post("/", createCoachingRequest);

// Update request status (accept/reject)
router.put("/:requestId", updateCoachingRequestStatus);

// Re-request after rejection
router.put("/:requestId/re-request", reRequestCoaching);

// Cancel/delete a coaching request
router.delete("/:requestId", cancelCoachingRequest);

// Get requests for a specific coach
router.get("/coach/:coachId", getCoachRequests);

// Get requests for a specific coachee
router.get("/coachee/:coacheeId", getCoacheeRequests);

// Get a single request by ID
router.get("/:requestId", getCoachingRequestById);

// Get all requests (admin)
router.get("/", getAllCoachingRequests);

module.exports = router;
