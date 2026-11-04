const router = require("express").Router();

const { chat } = require("../controllers/ai_controller");

router.post('/chat', chat);

module.exports = router;
