const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

// ✅ Store filenames in memory (temporary storage)
const uploadedFilesMap = new Map();

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // ✅ Get original file name (before modification)
        const originalFileName = req.file.originalname.split('.').slice(0, -1).join('.');
        const fileExtension = req.file.originalname.split('.').pop();

        // Get current date-time formatted as YYYYMMDD_HHMMSS
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
        const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

        // ✅ Modified filename with timestamp
        const modifiedFileName = `${originalFileName}_${formattedDate}_${formattedTime}.${fileExtension}`;

        const blockBlobClient = containerClient.getBlockBlobClient(modifiedFileName);

        console.log("Uploading file:", modifiedFileName);

        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: req.file.mimetype }
        });

        console.log("File uploaded successfully to Azure");

        // ✅ Store original filename mapped to modified filename
        uploadedFilesMap.set(modifiedFileName, originalFileName);

        res.status(200).json({ 
            message: "File uploaded successfully", 
            url: blockBlobClient.url, 
            modifiedFileName: modifiedFileName // Return modified filename if needed
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};

module.exports = { upload, uploadFile, uploadedFilesMap };