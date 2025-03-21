// Load the express module
const express = require('express');

// Create an Express app
const app = express();

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

// Handle a POST request to the root URL ('/') and log the request body
app.post("/", (req, res) => {
    console.log("Received POST request:", req.body); // This should now print the correct data
    res.send("Data received");
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log('Server is up and running on port 3000');
});
