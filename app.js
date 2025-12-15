require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

// Import routes and models
const authRoutes = require('./routes/authRoutes');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Middleware to make user data available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.userId ? {
        name: req.session.userName,
        role: req.session.userRole
    } : null;
    next();
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static('public'));

// Routes
app.use('/', authRoutes);

// Protected route example with inline middleware
app.get('/admin', requireAuth, (req, res) => {
    if (req.session.userRole !== 'admin') {
        return res.status(403).render('error', {
            title: 'Access Denied',
            message: 'Admin access required'
        });
    }
    res.render('admin', { title: 'Admin Panel', user: res.locals.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Database: ${process.env.MONGODB_URI}`);
    console.log(`🔐 Session secret: ${process.env.SESSION_SECRET ? 'Set' : 'Not set'}`);
});