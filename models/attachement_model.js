const mongoose = require("mongoose");

const attachementsSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: {type: String},
  url: {type: String},
});

const Attachement = mongoose.model("Attachement", attachementsSchema);
module.exports = Attachement;
