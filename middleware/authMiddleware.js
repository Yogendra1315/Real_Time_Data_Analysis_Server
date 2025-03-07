const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const protect = async (req, res, next) => {
    let token;

    // Check if token is present in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Extract token from header
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

            // Find user and attach to request
            req.user = await User.findById(decoded.userId).select("-password");

            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
};

module.exports = { protect };