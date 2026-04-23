const mongoose = require("mongoose");
const { Schema } = mongoose;

const costItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    unit: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    periodOfUse: { type: Number },
    resaleValue: { type: Number },
  },
  { _id: false }
);

const labourItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    unit: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const revenueItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, default: "" },
    unit: { type: String, default: "" },
    quantity: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    type: { type: String, enum: ["product", "by-product"], required: true },
  },
  { _id: false }
);

const financialSheetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ventureId: { type: Schema.Types.ObjectId, ref: "Venture", required: true },
    currency: { type: String, required: true, maxlength: 5 },
    exchangeRate: { type: Number, required: true, min: 0 },
    fixedCosts: { type: [costItemSchema], default: [] },
    variableCosts: {
      inputsServices: { type: [costItemSchema], default: [] },
      labour: { type: [labourItemSchema], default: [] },
    },
    revenueItems: { type: [revenueItemSchema], default: [] },
  },
  { timestamps: true }
);

financialSheetSchema.index({ userId: 1, ventureId: 1 }, { unique: true });

module.exports = mongoose.model(
  "FinancialSheet",
  financialSheetSchema,
  "financesheets"
);
