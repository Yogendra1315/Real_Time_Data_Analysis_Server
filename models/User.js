const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 // Ensure passwords are at least 6 characters long
    },
    username: { type: String, required: true }
});

// Connect to the 'User' database and use the 'LoginDetails' collection
const db = mongoose.connection.useDb('User');
module.exports = db.model('User', userSchema, 'LoginDetails');
