const mongoose = require("mongoose");

const costLineSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const fixedCostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    periodOfUse: { type: Number },
    resaleValue: { type: Number },
  },
  { _id: false }
);

const revenueItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    type: { type: String, enum: ["product", "by-product"], required: true },
  },
  { _id: false }
);

const financeSheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
      index: true,
    },
    currency: { type: String, required: true, maxlength: 5, trim: true },
    exchangeRate: { type: Number, required: true },
    fixedCosts: { type: [fixedCostSchema], default: [] },
    variableCosts: {
      inputsServices: { type: [costLineSchema], default: [] },
      labour: { type: [costLineSchema], default: [] },
    },
    revenueItems: { type: [revenueItemSchema], default: [] },
  },
  { timestamps: true }
);

financeSheetSchema.index({ userId: 1, ventureId: 1 }, { unique: true });

const FinanceSheet = mongoose.model("FinanceSheet", financeSheetSchema);

module.exports = FinanceSheet;
