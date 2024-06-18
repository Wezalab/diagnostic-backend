const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  idCoach: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  idCoachee: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
  status: {
    type: String,
    enum: ["ACCEPETED", "REJECTED", "DONE", "CANCEL", "PENDING"],
    default: "PENDING",
  },
  title: { type: String},
  allDay: { type: Boolean,  default: false},
  color: { type: String, default:"#00A76F"},
  description: { type: String,  default: ""},
  start : { type: Date, default: Date.now()},
  end: { type: Date, default: Date.now()},
  gmail: { type: String,  default: ""}
});

const Session = mongoose.model("Session", sessionSchema);
module.exports = Session;
