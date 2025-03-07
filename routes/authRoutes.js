const express = require("express");
const { signup, login, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", protect, getUserProfile); // Protected route

module.exports = router;