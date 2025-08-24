const mongoose = require("mongoose");

const attachementsSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: { type: String },
  url: { type: String, required: true },
  filename: { type: String }, // Actual filename on disk
  originalName: { type: String }, // Original filename from upload
  mimeType: { type: String }, // File MIME type
  size: { type: Number }, // File size in bytes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Attachement = mongoose.model("Attachement", attachementsSchema);
module.exports = Attachement;
