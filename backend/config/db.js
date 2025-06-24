const mongoose = require("mongoose");
require("dotenv").config();     // Load environment variables from a .env file into process.env


// Define an asynchronous function to connect to MongoDB
const connectDB = async () => { 
    try {            //try block attempts to connect to MongoDB.
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (err) {          //If there's an error, the catch block handles it.
        console.error("MongoDB Connection Failed:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
