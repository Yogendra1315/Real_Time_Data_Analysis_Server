const express = require("express");
const { getPowerBIEmbedUrl } = require("../controllers/powerbiController"); // Import controller

const router = express.Router();

router.get("/embed", getPowerBIEmbedUrl); // Route now uses the controller

module.exports = router;
