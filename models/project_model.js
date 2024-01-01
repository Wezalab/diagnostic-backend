const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  company_name: { type: String, required: true },
  company_name_evaluation: { type: [evaluationCompanyNameSchema], default: [] },
  logo: { type: String },
  logo_evaluation: { type: [evaluationLogoSchema], default: [] },
  mini_bio: { type: String, required: true },
  evaluation_mini_bio: { type: [evaluationMiniBioSchema], default: [] },
  description: { type: String },
  description_evaluation: { type: [evaluationDescriptionSchema], default: [] },
  founding_date: { type: Date },
  founding_date_evaluation: {
    type: [evaluationFoundingDateSchema],
    default: [],
  },
  mission: { type: String },
  mission_evaluation: { type: [evaluationMissionSchema], default: [] },
  valeur: { type: String },
  valeur_evaluation: { type: [evaluationValeurSchema], default: [] },
  objectifs: { type: String },
  objectifs_evaluation: { type: [evaluationObjectifsSchema], default: [] },
  smart_ip: { type: String },
  smart_ip_evaluation: { type: [evaluationSmartIpSchema], default: [] },
  objectif_social: { type: String },
  objectif_social_evaluation: {
    type: [evaluationObjectifSocialSchema],
    default: [],
  },
  phone: { type: String },
  Phone_evaluation: { type: [evaluationPhoneSchema], default: [] },
  full_address: { type: String },
  full_address_evaluation: { type: [evaluationFullAddressSchema], default: [] },
  secteur: {
    type: [String],
    enum: ["AGRO-TRANSFORMATION", "SERVICE", "AUTRE"],
  },
  Secteur_evaluation: { type: [evaluationSecteurSchema], default: [] },
  secteur_activite_details: { type: [String] },
  secteur_activite_detail_evaluation: {
    type: [evaluationSecteurActiviteDetailSchema],
    default: [],
  },
  stage: { type: String },
  stage_evaluation: { type: [evaluationStageSchema], default: [] },
  type_of_customers: {
    type: [String],
    enum: ["B2B", "B2B2B", "B2B2C", "B2B2G", "B2C", "C2C", "Governments (B2G)"],
  },
  type_of_customers_evaluation: {
    type: [evaluationTypeOfCustomersSchema],
    default: [],
  },
  customer_base: {
    type: [String],
    enum: ["Clientèle Urbaine", "Clientèle Rurale"],
  },
  customer_base_evaluation: {
    type: [evaluationCustomerBaseSchema],
    default: [],
  },
  pitch_text: { type: String },
  pitch_text_evaluation: { type: [evaluationPitchTextSchema], default: [] },
  pitch_deck_url: { type: String },
  pitch_deck_url_evaluation: {
    type: [evaluationPitchDeckUrlSchema],
    default: [],
  },
  last_score: { type: Number },
  last_status: { type: String },
  last_Value: { type: String },
  website: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Owner
});

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

const evaluationLogoSchema = mongoose.Schema({
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

const evaluationMiniBioSchema = mongoose.Schema({
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

const Project = mongoose.model("Projects", projectSchema);
module.exports = Project;
