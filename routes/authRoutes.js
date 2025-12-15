const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/dashboard', isAuthenticated, authController.dashboard);

router.get('/logout', authController.logout);

module.exports = router;
