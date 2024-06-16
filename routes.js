const express = require('express');
const router = express.Router();
const client = require('./db');
const bcrypt = require('bcrypt');
const moment = require('moment');
const path = require('path');
const multer = require('multer');
const ObjectId = require('mongodb').ObjectId;

const db = client.db('global_care_db');

// Middleware to check if the user is logged in
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Define storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '/public/images')); // Adjust path as necessary
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Initialize multer instance with storage options
const upload = multer({ storage: storage });

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

// Login route (GET to serve the login page)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Handle login form submission (POST to process login)
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
        console.error('Error logging in:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle blog form submission
router.post('/post-blog', upload.single('picture'), async (req, res) => {
    const { title, content, authorName } = req.body;
    const picture = req.file;
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    
    try {
        if (!title || !content || !authorName || !picture) {
            return res.status(400).send('Please fill in all fields');
        }
        
        const newBlog = {
            title,
            content,
            authorName,
            picture: '/images/' + picture.filename,
            date: now,
            time: now,
        };

        await db.collection('blogs').insertOne(newBlog);
        res.status(200).send('Blog posted successfully');
    } catch (error) {
        console.error('Error posting blog:', error);
        res.status(500).send('Error posting blog');
    }
});

// API routes to fetch data for admin dashboard (require login middleware)
router.get('/api/volunteers', requireLogin, async (req, res) => {
    try {
        const volunteers = await db.collection('volunteers').find().toArray();
        res.json(volunteers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteers' });
    }
});

router.get('/api/blogs', requireLogin, async (req, res) => {
    try {
        const blogs = await db.collection('blogs').find().toArray();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs' });
    }
});

router.get('/api/donors', requireLogin, async (req, res) => {
    try {
        const donors = await db.collection('donations').find().toArray();
        res.json(donors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching donors' });
    }
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
    const { name, email, amount, category, dob } = req.body;
    const validCategories = ['clothes', 'food', 'fund', 'footwear', 'gadgets', 'stationary'];

    // Function to validate date in YYYY-MM-DD format
    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) {
            return false;
        }
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    // Validate the donation category
    if (!validCategories.includes(category)) {
        return res.status(400).send('Invalid donation category');
    }

    // Validate the date of birth
    if (!isValidDate(dob)) {
        return res.status(400).send('Invalid date of birth');
    }

    try {
        await db.collection('donations').insertOne({ name, email, amount, category, dob });
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
        console.error('Error signing up user:', error);
        res.status(500).send('Error signing up user');
    }
});
// API route to get the authenticated user's info
router.get('/api/auth-user', requireLogin, (req, res) => {
    const user = req.session.user;
    res.json({ name: user.name });
});
// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
});

// Admin dashboard route (protected route, requires login)
router.get('/dashboard', requireLogin, (req, res) => {
    const user = req.session.user;
    
    if (user.isAdmin === "true") {
        res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
    } else {
        res.status(403).send('You do not have permission to access this page');
    }
});

// Serve blog details page
router.get('/blog-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/blog-details.html'));
});

// API to get a blog by ID (require login middleware)
// API to get a blog by ID (require login middleware)
router.get('/api/blog/:id', requireLogin, async (req, res) => {
    const blogId = req.params.id;
    
    try {
        const blog = await db.collection('blogs').findOne({ _id: new ObjectId(blogId) });
        
        if (blog) {
            res.json(blog); // Return the blog data as JSON
        } else {
            res.status(404).send('Blog not found');
        }
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send('Error fetching blog');
    }
});



module.exports = router;
