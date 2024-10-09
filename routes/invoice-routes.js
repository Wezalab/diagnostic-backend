const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice_controller');

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.get('/from/:userId', invoiceController.getInvoicesByFromUserId); // Get invoices by sender user ID
router.get('/to/:userId', invoiceController.getInvoicesByToUserId); // Get invoices by recipient user ID
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;