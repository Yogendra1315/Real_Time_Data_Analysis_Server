const express = require("express");
const { getPowerBIEmbedUrl } = require("../controllers/powerbiController");

const router = express.Router();

router.get("/embed", getPowerBIEmbedUrl);

module.exports = router;