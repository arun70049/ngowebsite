const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const client = require('./db');
const session = require('express-session');
const routes = require('./routes');

const app = express();
const port = 5000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure session middleware
app.use(session({
    secret: 'your_secret_key', // Change to a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));

// Use routes
app.use('/', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
