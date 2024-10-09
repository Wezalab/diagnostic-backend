const Invoice = require('../models/invoice_model');

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(400).json({ message: 'Error creating invoice', error: error.message });
  }
};

// Get all invoices
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('invoiceFrom').populate('invoiceTo').populate('sessions');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Get a single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('invoiceFrom').populate('invoiceTo').populate('sessions');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
};

// Get invoices by invoiceFrom (user ID)
exports.getInvoicesByFromUserId = async (req, res) => {
  try {
    const invoices = await Invoice.find({ invoiceFrom: req.params.userId })
      .populate('invoiceFrom')
      .populate('invoiceTo')
      .populate('sessions');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Get invoices by invoiceTo (user ID)
exports.getInvoicesByToUserId = async (req, res) => {
  try {
    const invoices = await Invoice.find({ invoiceTo: req.params.userId })
      .populate('invoiceFrom')
      .populate('invoiceTo')
      .populate('sessions');
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

// Update an invoice by ID
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(400).json({ message: 'Error updating invoice', error: error.message });
  }
};

// Delete an invoice by ID
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};