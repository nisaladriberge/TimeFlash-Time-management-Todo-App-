const mongoose = require("mongoose");

// Define schema for TodoTask
const todoTaskSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Export model based on the schema
module.exports = mongoose.model("TodoTask", todoTaskSchema);
