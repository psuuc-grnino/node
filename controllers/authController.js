const User = require('../models/user');

// Display registration form
exports.showRegisterForm = (req, res) => {
    res.render('register', { 
        title: 'Register',
        user: null,
        errors: []
    });
};

// Handle registration
exports.register = async (req, res) => {
    try {
        const { name, age, email, password, confirmPassword } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.render('register', {
                title: 'Register',
                user: { name, age, email },
                errors: ['Passwords do not match']
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', {
                title: 'Register',
                user: { name, age, email },
                errors: ['Email already registered']
            });
        }
        
        // Create new user
        const user = new User({
            name,
            age: parseInt(age),
            email,
            password
        });
        
        await user.save();
        
        // Store user in session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userRole = user.role;
        
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.render('register', {
                title: 'Register',
                user: req.body,
                errors
            });
        }
        
        res.render('register', {
            title: 'Register',
            user: req.body,
            errors: ['An error occurred during registration']
        });
    }
};

// Display login form
exports.showLoginForm = (req, res) => {
    res.render('login', {
        title: 'Login',
        errors: []
    });
};

// Handle login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user with password
        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.render('login', {
                title: 'Login',
                errors: ['Invalid email or password']
            });
        }
        
        // Check if user is active
        if (!user.isActive) {
            return res.render('login', {
                title: 'Login',
                errors: ['Account is deactivated']
            });
        }
        
        // Compare password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.render('login', {
                title: 'Login',
                errors: ['Invalid email or password']
            });
        }
        
        // Store user in session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userRole = user.role;
        req.session.loginTime = new Date();
        
        res.redirect('/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            title: 'Login',
            errors: ['An error occurred during login']
        });
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
};

// Dashboard
exports.dashboard = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    res.render('dashboard', {
        title: 'Dashboard',
        user: {
            name: req.session.userName,
            role: req.session.userRole,
            loginTime: req.session.loginTime
        }
    });
};

// Protected page example
exports.protectedPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    
    res.render('protected', {
        title: 'Protected Page',
        user: {
            name: req.session.userName,
            role: req.session.userRole
        }
    });
};