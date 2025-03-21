// Load the express module
const express = require('express');

// Create an Express app
const app = express();

// Load environment variables
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask"); // Import the model
dotenv.config();

// Middleware to parse form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use("/static", express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

// Define a route handler for GET request to the root URL ('/')
app.get('/', (req, res) => {
  res.render('todo.ejs');
});

// Handle a POST request to create a new task
app.post("/", async (req, res) => {
    try {
        // Create a new todoTask instance
        const todoTask = new TodoTask({
            content: req.body.content // Assign posted value to "content"
        });

        // Save the new document in the database
        await todoTask.save();

        // Reload the page to the root path
        res.redirect("/");
    } catch (err) {
        console.error("Error saving task:", err);
        
        // Send an error response with status 500
        res.status(500).send("Internal Server Error");

        // Reload the page to the root path
        res.redirect("/");
    }
});

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to db");

    // Start the server after successful DB connection
    app.listen(3000, () => {
        console.log("Server is up and running on port 3000");
    });
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
