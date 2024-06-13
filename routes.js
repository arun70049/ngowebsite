const express = require('express');
const router = express.Router();
const client = require('./db');
const bcrypt = require('bcrypt');
const moment = require('moment');
const path = require('path'); // Added this line to fix the 'path is not defined' error
const db = client.db('global_care_db');

// Middleware to check if the user is logged in
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Serve HTML files
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

router.get('/blog-page1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/blog-page1.html'));
});

router.get('/volunteer', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/volunteer.html'));
});

router.get('/donation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/donation.html'));
});

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/sign-up.html'));
});

// Fetch data for the admin dashboard
router.get('/api/volunteers', async (req, res) => {
    try {
        const volunteers = await db.collection('volunteers').find().toArray();
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteers' });
    }
});

router.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await db.collection('blogs').find().toArray();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs' });
    }
});

router.get('/api/donors', async (req, res) => {
    try {
        const donors = await db.collection('donations').find().toArray();
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors' });
    }
});

// Handle blog form submission
router.post('/post-blog', async (req, res) => {
    const { title, content, authorName, picture } = req.body;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    try {
        await db.collection('blogs').insertOne({
            title,
            content,
            authorName,
            picture,
            date: now,
            time: now,
        });
        res.status(200).send('Blog posted successfully');
    } catch (error) {
        res.status(500).send('Error posting blog');
    }
});
// API route to get the authenticated user's info
router.get('/api/auth-user', requireLogin, (req, res) => {
    const user = req.session.user;
    res.json({ name: user.name });
});
// Handle volunteer form submission
router.post('/submit-volunteer', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.collection('volunteers').insertOne({ name, email, message });
        res.status(200).send('Volunteer form submitted successfully');
    } catch (error) {
        res.status(500).send('Error submitting volunteer form');
    }
});

// Handle donation form submission
router.post('/submit-donation', async (req, res) => {
    const { name, email, amount, category } = req.body;
    const validCategories = ['clothes', 'food', 'fund', 'footwear', 'gadgets', 'stationary'];
    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid donation category');
    }
    try {
        await db.collection('donations').insertOne({ name, email, amount, category });
        res.status(200).send('Donation form submitted successfully');
    } catch (error) {
        res.status(500).send('Error submitting donation form');
    }
});

// Handle user sign up
router.post('/user', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.collection('users').insertOne({ name, email, password: hashedPassword, isAdmin: "False" });
        res.status(200).send('User signed up successfully');
    } catch (error) {
        res.status(500).send('Error signing up user');
    }
});

// Login route
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const usersCollection = db.collection('users');
    try {
        const user = await usersCollection.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.send('Invalid username or password');
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
    });
});

// Admin dashboard route (protected route, requires login)
router.get('/dashboard', requireLogin, (req, res) => {
    const user = req.session.user;
    if (user.isAdmin === "true") {
        res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
    } else {
        res.send('You do not have permission to access this page');
    }
});
// Serve blog details page
router.get('/blog-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/blog-page1.html'));
});

// API to get a blog by ID
router.get('/api/blog/:id', async (req, res) => {
    const blogId = req.params.id;
    try {
        const blog = await db.collection('blogs').findOne({ _id: new ObjectId(blogId) });
        if (blog) {
            res.json(blog);
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Error fetching blog');
    }
});

module.exports = router;
