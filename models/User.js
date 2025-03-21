const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    username: { type: String, required: true },

    // ✅ Additional fields
    profilePicture: { 
        type: String, 
        default: "/image/default-profile.png"// Set a default profile picture
    },
    bio: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
}, { timestamps: true }); // ✅ Automatically adds createdAt & updatedAt

// ✅ Use specific database ('User') and collection name ('LoginDetails')
const db = mongoose.connection.useDb('User');
module.exports = db.model('User', userSchema, 'LoginDetails');