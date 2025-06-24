const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    invoiceNumber: { 
        type: String, 
        required: true, 
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {                      
        type: String,
        required: true,
    },
    cardNumber: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: String,
        required: true,
    },
    cvv: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    refundStatus: {
        type: Boolean, 
        default: false 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model("Payment", PaymentSchema);
