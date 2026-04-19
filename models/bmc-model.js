const mongoose = require("mongoose");

const BMC_BLOCK_KEYS = [
  "customerSegments",
  "valuePropositions",
  "channels",
  "customerRelationships",
  "revenueStreams",
  "keyResources",
  "keyActivities",
  "keyPartnerships",
  "costStructure",
];

const blockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    key: { type: String, enum: BMC_BLOCK_KEYS, required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: false }
);

const strategySuggestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    category: { type: String, enum: ["growth", "monetization", "risk"], required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const bmcSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
    blocks: {
      type: [blockSchema],
      default: [],
    },
    strategySuggestions: {
      type: [strategySuggestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const BusinessModelCanvas = mongoose.model("BusinessModelCanvas", bmcSchema);

module.exports = { BusinessModelCanvas, BMC_BLOCK_KEYS };
