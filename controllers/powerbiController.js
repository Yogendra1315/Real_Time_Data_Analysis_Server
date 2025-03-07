const fetch = require("node-fetch"); // Ensure fetch is available in Node.js
require("dotenv").config();
const { uploadedFilesMap } = require("../controllers/uploadController"); // ✅ Import uploadedFilesMap

const {
    POWER_BI_TENANT_ID,
    POWER_BI_CLIENT_ID,
    POWER_BI_CLIENT_SECRET,
    POWER_BI_WORKSPACE_ID
} = process.env;

/**
 * Get access token for Power BI API
 */
async function getAccessToken() {
    const url = `https://login.microsoftonline.com/${POWER_BI_TENANT_ID}/oauth2/v2.0/token`;
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const data = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: POWER_BI_CLIENT_ID,
        client_secret: POWER_BI_CLIENT_SECRET,
        scope: "https://analysis.windows.net/powerbi/api/.default"
    });

    try {
        const response = await fetch(url, { method: "POST", headers, body: data });

        if (!response.ok) {
            throw new Error(`Failed to get token: ${response.statusText}`);
        }

        const result = await response.json();
        return result.access_token;
    } catch (error) {
        console.error("Error getting Power BI access token:", error);
        return null;
    }
}

/**
 * Get Power BI report ID by report name
 */
async function getReportIdByName(token, reportName) {
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${POWER_BI_WORKSPACE_ID}/reports`;

    try {
        const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}` } });

        if (!response.ok) {
            throw new Error(`Failed to get reports: ${response.statusText}`);
        }

        const result = await response.json();
        const reports = result.value;

        if (!reports || reports.length === 0) {
            throw new Error("No reports found in the workspace.");
        }

        // Find report by name (case-insensitive)
        const report = reports.find(r => r.name.toLowerCase() === reportName.toLowerCase());
        if (!report) {
            throw new Error(`Report with name "${reportName}" not found.`);
        }
        return report.id;
    } catch (error) {
        console.error("Error fetching report by name:", error);
        return null;
    }
}

/**
 * Controller function to get Power BI Embed URL
 */
exports.getPowerBIEmbedUrl = async (req, res) => {
    const { modifiedFileName } = req.query; // Get modified filename from request

    if (!modifiedFileName) {
        return res.status(400).json({ error: "Modified file name is required" });
    }

    // ✅ Get original filename from uploadedFilesMap
    const originalFileName = uploadedFilesMap.get(modifiedFileName);

    if (!originalFileName) {
        return res.status(404).json({ error: "Original filename not found for this upload" });
    }

    console.log(`🔍 Searching Power BI for report: ${originalFileName}`);

    // ✅ Get access token for Power BI
    const token = await getAccessToken();
    if (!token) return res.status(500).json({ error: "Failed to get token" });

    // ✅ Get report ID based on the original file name
    const reportId = await getReportIdByName(token, originalFileName);
    if (!reportId) return res.status(404).json({ error: "Report not found in Power BI" });

    // ✅ Fetch Power BI report details using the report ID
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${POWER_BI_WORKSPACE_ID}/reports/${reportId}`;

    try {
        const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}` } });

        if (!response.ok) {
            throw new Error(`Failed to get report details: ${response.statusText}`);
        }

        const result = await response.json();

        // ✅ Return the embed URL and access token to the frontend
        res.json({
            embedUrl: result.embedUrl,
            accessToken: token // Frontend can use this for embedding
        });
    } catch (error) {
        console.error("Error fetching report details:", error);
        res.status(500).json({ error: "Failed to get report details" });
    }
};