const mongoose = require("mongoose");

const costLineSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: String,
    unit: String,
    quantity: Number,
    unitPrice: Number,
  },
  { _id: false }
);

const fixedCostSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: String,
    unit: String,
    quantity: Number,
    unitPrice: Number,
    periodOfUse: Number,
    resaleValue: Number,
  },
  { _id: false }
);

const revenueItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: String,
    unit: String,
    quantity: Number,
    unitPrice: Number,
    type: { type: String, enum: ["product", "by-product"], required: true },
  },
  { _id: false }
);

const financialSheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ventureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venture",
      required: true,
    },
    currency: { type: String, required: true, maxlength: 5 },
    exchangeRate: { type: Number, required: true, min: 0 },
    fixedCosts: [fixedCostSchema],
    variableCosts: {
      inputsServices: [costLineSchema],
      labour: [costLineSchema],
    },
    revenueItems: [revenueItemSchema],
  },
  { timestamps: true }
);

financialSheetSchema.index({ userId: 1, ventureId: 1 }, { unique: true });

const FinanceSheet = mongoose.model("FinanceSheet", financialSheetSchema);

module.exports = FinanceSheet;
