const express = require("express");
const { register, login } = require("../controllers/userController");
const router = express.Router();

// Define route for user registration
router.post("/register", register);

// Define route for user login
router.post("/login", login);

module.exports = router;