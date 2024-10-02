const mongoose = require("mongoose");

const coachingSchema = new mongoose.Schema({
  autre: {type: String},
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED","PENDING"],
    default: "PENDING",
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  coache: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const Coaching = mongoose.model("Coaching", coachingSchema);
module.exports = Coaching;
