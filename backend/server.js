require("dotenv").config();     //load environment from .env file 
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const paymentRoutes = require("./routes/paymentRoutes");

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/payments", require("./routes/paymentRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
