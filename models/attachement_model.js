const mongoose = require("mongoose");

const attachementsSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: {type: String},
  url: {type: String},
});

const Social = mongoose.model("Social", attachementsSchema);
module.exports = Social;
