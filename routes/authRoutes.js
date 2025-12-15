const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Home/Index
router.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Registration routes
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.register);

// Login routes
router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Dashboard route
router.get('/dashboard', authController.dashboard);

// Protected page example
router.get('/protected', authController.protectedPage);

module.exports = router;