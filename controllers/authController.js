const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

/**
 * Generate JWT token
 */
const generateToken = (userId, username) => {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Signup Controller
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate username from email
        const username = email.split("@")[0];

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({ name, email, password: hashedPassword, username });
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser._id, newUser.username);

        res.status(201).json({ message: "User registered successfully", token, user: { username, email } });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * Login Controller
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Both email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = generateToken(user._id, user.username);

        res.status(200).json({ message: "Login successful", token, user: { username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * Get User Profile (Protected Route)
 */
exports.getUserProfile = async (req, res) => {
    res.status(200).json({ user: req.user });
};