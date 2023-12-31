const mongoose = require("mongoose");

const evaluationCompanyNameSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationDescriptionSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationFoundingDateSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationMissionSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationValeurSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationObjectifsSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationSmartIpSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationObjectifSocialSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationPhoneSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationFullAddressSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationSecteurSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationSecteurActiviteDetailSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationStageSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationTypeOfCustomersSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationCustomerBaseSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationPitchTextSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const evaluationPitchDeckUrlSchema = mongoose.Schema({
  recommendation_coach: { type: String },
  completed_by_user: { type: String },
  score_by_coach: { type: Number },
  status_by_coach: {
    type: String,
    enum: ["Necessite Changement", "Refusé", "Approuvé"],
  },
  date_changement: { type: Date, default: Date.now() },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Coach
});

const projectSchema = mongoose.Schema({
  company_name: { type: String, required: true },
  company_name_evaluation: { type: [evaluationCompanyNameSchema], default: [] },
  description: { type: String },
  evaluationDescription: { type: [evaluationDescriptionSchema], default: [] },
  founding_date: { type: Date },
  evaluationFoundingDate: { type: [evaluationFoundingDateSchema], default: [] },
  mission: { type: String },
  evaluationMission: { type: [evaluationMissionSchema], default: [] },
  valeur: { type: String },
  evaluationValeur: { type: [evaluationValeurSchema], default: [] },
  objectifs: { type: String },
  evaluationObjectifs: { type: [evaluationObjectifsSchema], default: [] },
  smart_ip: { type: String },
  evaluationSmartIp: { type: [evaluationSmartIpSchema], default: [] },
  objectif_social: { type: String },
  evaluationObjectifSocial: {
    type: [evaluationObjectifSocialSchema],
    default: [],
  },
  phone: { type: String },
  evaluationPhone: { type: [evaluationPhoneSchema], default: [] },
  full_address: { type: String },
  evaluationFullAddress: { type: [evaluationFullAddressSchema], default: [] },
  secteur: {
    type: [String],
    enum: ["AGRO-TRANSFORMATION", "SERVICE", "AUTRE"],
  },
  evaluationSecteur: { type: [evaluationSecteurSchema], default: [] },
  secteur_activite_details: { type: [String] },
  evaluationSecteurActiviteDetail: {
    type: [evaluationSecteurActiviteDetailSchema],
    default: [],
  },
  stage: { type: String },
  evaluationStage: { type: [evaluationStageSchema], default: [] },
  type_of_customers: {
    type: [String],
    enum: ["B2B", "B2B2B", "B2B2C", "B2B2G", "B2C", "C2C", "Governments (B2G)"],
  },
  evaluationTypeOfCustomers: {
    type: [evaluationTypeOfCustomersSchema],
    default: [],
  },
  customer_base: {
    type: [String],
    enum: ["Clientèle Urbaine", "Clientèle Rurale"],
  },
  evaluationCustomerBase: { type: [evaluationCustomerBaseSchema], default: [] },
  pitch_text: { type: String },
  evaluationPitchText: { type: [evaluationPitchTextSchema], default: [] },
  pitch_deck_url: { type: String },
  evaluationPitchDeckUrl: { type: [evaluationPitchDeckUrlSchema], default: [] },
  score: { type: Number },
  website: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Owner
});

const Project = mongoose.model("Projects", projectSchema);
module.exports = Project;
