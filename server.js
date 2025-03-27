// Load environment variables
require("dotenv").config();
// Import necessary packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Import custom modules
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const powerBIRoutes = require("./routes/powerbi");

// Initialize Express App
const app = express();
// Connect to MongoDB
connectDB();
// CORS Configuration
app.use(cors);

// const allowedOrigins = ["http://localhost:3000"];
// app.use(
//     cors({
//         origin: allowedOrigins,
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         credentials: true,
//     })
// );
// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
});
// Default Route
app.get("/", (req, res) => {
    res.json({ message: "API is running..." });
});
// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/powerbi", powerBIRoutes);
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));