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
    value_from_user: { type: String },
  },
});

const projectSchema = mongoose.Schema({
  company_name: { type: String, required: true },
  description: { type: String, unique: true },
  founding_date: { type: Date, required: true },
  mission: { type: String, unique: true },
  valeur: { type: String, required: true },
  objectifs: { type: String, required: true },
  smart_ip: { type: String },
  objectif_social: { type: String },
  phone: { type: String, required: true },
  full_address: { type: String },
  secteur: { type: String, enum: ["AGRO-TRANSFORMATION", "SERVICE"] },
  type_of_customers: { type: [String], required: true },
  customer_base: { type: String, required: true },
  pitch_text: { type: String },
  pitch_deck_url: { type: String },
  website: { type: String },
  recommendation: { type: recommendationSchema },
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
