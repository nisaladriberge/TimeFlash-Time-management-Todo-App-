// Load the express module
const express = require('express');

// Create an Express app
const app = express();

// Load environment variables
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");

dotenv.config();

// Middleware to parse form data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use("/static", express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

// Define a route handler for GET request to fetch and display tasks
app.get('/', async (req, res) => {
  try {
    const tasks = await TodoTask.find(); // Retrieve all tasks from the database
    res.render('todo.ejs', { tasks: tasks }); // Pass tasks to the frontend
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.render('todo.ejs', { tasks: [] }); // Pass empty array if error
  }
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

// Route for deleting a task
app.get('/remove/:id', async (req, res) => {
  try {
    // Find the task by ID and remove it
    await TodoTask.findByIdAndDelete(req.params.id);
    
    // Redirect back to the main page
    res.redirect('/');
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send("Error deleting task");
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