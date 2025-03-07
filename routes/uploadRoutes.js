const express = require("express");
const { upload, uploadFile } = require("../controllers/uploadController");

const router = express.Router();

// Route to handle file upload
router.post("/", upload.single("file"), uploadFile);

module.exports = router;