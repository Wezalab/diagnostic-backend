const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  socialMedia: {type: String},
  url: {type: String},
});

const Social = mongoose.model("Social", socialSchema);
module.exports = Social;
