const mongoose = require("mongoose");

// Define the invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true }, // Unique invoice number
  taxes: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  sent: { type: Number, default: 0 },
  subTotalPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createDate: { type: Date, default: Date.now },
  dueDate: { type: Date, default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }, // 15 days from now
  status: { type: String, enum: ['paid', 'unpaid', 'overdue', 'draft'], default: 'unpaid' },
  invoiceFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID for the sender
  invoiceTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID for the recipient
  sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }], // Reference to sessions
});

// Pre-save hook to generate invoice number
invoiceSchema.pre('save', function(next) {
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    this.invoiceNumber = `${year}-${month}-${day}-INV`;
  }
  next();
});

// Create the Invoice model
const Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports = Invoice;