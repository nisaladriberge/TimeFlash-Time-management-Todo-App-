// Load modules
const express = require('express');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const TodoTask = require("./models/TodoTask");
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

// Initialize environment variables
dotenv.config();

// Create an Express app
const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use("/static", express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

// Use routes
app.use('/auth', authRoutes);

// Protected routes
app.use(authenticate);

// Home route - Fetch tasks
app.get('/', async (req, res) => {
  try {
    const tasks = await TodoTask.find({ user: req.user._id });
    res.render('todo.ejs', { tasks, user: req.user });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.render('todo.ejs', { tasks: [], user: req.user });
  }
});

// Create new task
app.post("/", async (req, res) => {
  try {
    const todoTask = new TodoTask({
      content: req.body.content,
      user: req.user._id
    });
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    console.error("Error saving task:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Update task completion
app.put("/tasks/:id/complete", async (req, res) => {
  try {
    const task = await TodoTask.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) return res.status(404).send("Task not found");

    await TodoTask.findByIdAndUpdate(req.params.id, {
      completed: req.body.completed
    });

    res.status(200).send("Task updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete a task
app.get('/remove/:id', async (req, res) => {
  try {
    const task = await TodoTask.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) return res.status(404).send("Task not found");

    await TodoTask.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).send("Error deleting task");
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB");

  // Use dynamic port for deployment
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error("Error connecting to MongoDB:", err);
});
