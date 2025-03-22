// Load the express module
const express = require('express');

// Create an Express app
const app = express();

// Load environment variables
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const TodoTask = require("./models/TodoTask");
const cookieParser = require('cookie-parser');

// Load routes
const authRoutes = require('./routes/auth');

// Load middleware
const { authenticate } = require('./middleware/auth');

dotenv.config();

// Middleware to parse form data, JSON data, and cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the "public" directory
app.use("/static", express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

// Use authentication routes
app.use('/auth', authRoutes);

// Protected routes - require authentication
app.use(authenticate);

// Define a route handler for GET request to fetch and display tasks
app.get('/', async (req, res) => {
  try {
    // Retrieve all tasks for the current user
    const tasks = await TodoTask.find({ user: req.user._id });
    res.render('todo.ejs', { 
      tasks: tasks,
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.render('todo.ejs', { 
      tasks: [],
      user: req.user
    });
  }
});

// Handle a POST request to create a new task
app.post("/", async (req, res) => {
  try {
    // Create a new todoTask instance
    const todoTask = new TodoTask({
      content: req.body.content,
      user: req.user._id // Associate task with current user
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

//UPDATE Task Completion
app.put("/tasks/:id/complete", async (req, res) => {
  try {
    // Make sure the task belongs to the current user
    const task = await TodoTask.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!task) {
      return res.status(404).send("Task not found");
    }
    
    await TodoTask.findByIdAndUpdate(req.params.id, { 
      completed: req.body.completed 
    });
    
    res.status(200).send("Task updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route for deleting a task
app.get('/remove/:id', async (req, res) => {
  try {
    // Make sure the task belongs to the current user
    const task = await TodoTask.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!task) {
      return res.status(404).send("Task not found");
    }
    
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