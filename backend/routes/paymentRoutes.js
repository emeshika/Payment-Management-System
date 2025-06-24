const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid"); // For invoice number

// Function to mask card number
const maskCardNumber = (cardNumber) => {
    return "**** **** **** " + cardNumber.slice(-4);
};

// @route   POST /api/payments/makePayment
// @desc    Process payment and store in database
router.post("/makePayment", async (req, res) => {
    try {
        const { name, cardNumber, expiryDate, cvv, address, email } = req.body;

        // Validate Input
        if (!name || !cardNumber || !expiryDate || !cvv || !address || !email) {
            return res.status(400).json({ success: false, message: "All fields including email are required" });
        }

        // Mask Card Number
        const maskedCard = maskCardNumber(cardNumber);

        // Generate an Invoice Number
        const invoiceNumber = uuidv4().slice(0, 8).toUpperCase();

        // Create Payment Record
        const newPayment = new Payment({
            name,
            email,
            cardNumber: maskedCard,
            expiryDate,
            cvv,
            address,
            invoiceNumber
        });

        // Save to MongoDB
        await newPayment.save();

        // Send response
        res.json({
            success: true,
            message: "Payment successful",
            invoiceNumber,
            name,
            maskedCard
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Payment failed", error: error.message });
    }
});

// @route   GET /api/payments/getAllPayments
// @desc    Retrieve all payments
router.get("/getAllPayments", async (req, res) => {
    try {
        const payments = await Payment.find();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving payments", error: error.message });
    }
});

// @route   GET /api/payments/refund/:invoiceID
// @desc    Retrieve payment details by invoice ID
router.get("/refund/:invoiceID", async (req, res) => {
    try {
        const { invoiceID } = req.params;
        const payment = await Payment.findOne({ invoiceNumber: invoiceID });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving payment", error: error.message });
    }
});

// @route   PUT /api/payments/refund/:invoiceID
// @desc    Update refund status of a payment
router.put("/refund/:invoiceID", async (req, res) => {
    try {
        const { invoiceID } = req.params;
        const { refundReason } = req.body;

        // Validate refund reason
        if (!refundReason) {
            return res.status(400).json({ success: false, message: "Refund reason is required" });
        }

        const updatedPayment = await Payment.findOneAndUpdate(
            { invoiceNumber: invoiceID },
            { refundStatus: true, refundReason },
            { new: true }
        );

        if (!updatedPayment) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.json({ success: true, message: "Refund processed successfully", updatedPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Refund failed", error: error.message });
    }
});

// @route   DELETE /api/payments/:invoiceID
// @desc    Delete payment record by invoice ID
router.delete("/:invoiceID", async (req, res) => {
    try {
        const { invoiceID } = req.params;
        const deletedPayment = await Payment.findOneAndDelete({ invoiceNumber: invoiceID });

        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

        res.json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Delete failed", error: error.message });
    }
});

// @route   GET /api/payments/byEmail/:email
// @desc    Retrieve all payments by a specific user's email
router.get("/byEmail/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const payments = await Payment.find({ email });

        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error retrieving payments by email", error: error.message });
    }
});

module.exports = router;
