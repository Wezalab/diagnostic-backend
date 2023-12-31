const mongoose = require("mongoose");

const recommendationSchema = mongoose.Schema({
  value: { type: String },
  validation: {
    actions_from_coach: [
      {
        recommendation: { type: String },
        isCompletedByUser: { type: Boolean, default: false },
      },
    ],
    completed_by_user: { type: String },
  },
});

const projectSchema = mongoose.Schema({
  company_name: { type: String, required: true },
  description: { type: String},
  founding_date: { type: Date },
  mission: { type: String },
  valeur: { type: String },
  objectifs: { type: String},
  smart_ip: { type: String },
  objectif_social: { type: String },
  phone: { type: String},
  full_address: { type: String },
  secteur: { type: [String], enum: ["AGRO-TRANSFORMATION", "SERVICE", "AUTRE"] },
  secteur_activite_details: { type: [String]},
  stage:  { type: String},
  type_of_customers: { type: [String]},
  customer_base: {
    type: [String],
    enum: ["Clientèle urbaine", "Clientèle rurale"],
  },
  pitch_text: { type: String },
  pitch_deck_url: { type: String },
  website: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Owner
  recommendation: { type: recommendationSchema },
});

const Project = mongoose.model("Projects", projectSchema);
module.exports = Project;
