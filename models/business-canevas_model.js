const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  company_name: {
    type: String,
    trim: true,
  },
  segment_clients: { type: [String] },
  valeurs_uniques: { type: [String] },
  canaux: { type: [String] },
  relation_clients: { type: [String] },
  source_revenus: { type: [String] },
  ressources_cles: { type: [String] },
  activites_cles: { type: [String] },
  partenariat_cles: { type: [String] },
  cout_structure: { type: [String] },
  autre_documents: { type: [String] },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
});

const BusinessCan = mongoose.model("BusinessCan", businessSchema);
module.exports = BusinessCan;
