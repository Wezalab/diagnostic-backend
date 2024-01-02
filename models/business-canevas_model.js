const mongoose = require("mongoose");

// Define the Business Schema
const businessSchema = new mongoose.Schema({
  company_name: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  segment_clients: [String], // Assuming an array of customer segments
  valeurs_uniques: [String], // Assuming an array of value propositions
  canaux: [String], // Assuming an array of channels
  relation_clients: [String], // Assuming an array of customer relationships
  source_revenus: [String], // Assuming an array of revenue streams
  ressources_cles: [String], // Assuming an array of key resources
  activites_cles: [String], // Assuming an array of key activities
  partenariat_cles: [String], // Assuming an array of key partnerships
  cout_structure: [String], // Assuming an array of cost structure items
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Create the Business Model
const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
