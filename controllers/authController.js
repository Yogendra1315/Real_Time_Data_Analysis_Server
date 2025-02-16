const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Assuming you have a User model defined
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variable for security

/**
 * Signup Controller
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.setHeader("Content-Type", "application/json");
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate username from email
        const username = email.split('@')[0];

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username,
        });

        await newUser.save();
        res.setHeader("Content-Type", "application/json");
        res.status(201).json({ message: 'User registered successfully', user: { email, username } });
    } catch (error) {
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


/**
 * Login Controller
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Both email and password are required' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
