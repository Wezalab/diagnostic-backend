const mongoose = require("mongoose");

const coachingSchema = new mongoose.Schema({
  autre: {type: String},
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  coache: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Coaching = mongoose.model("Coaching", coachingSchema);
module.exports = Coaching;
