const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  idCoach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  idCoachee: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED", "DONE", "CANCEL"],
    default: "PENDING",
  }
});

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
