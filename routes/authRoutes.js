// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const path = require('path');

// 注册和登录路由
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/login.html'));
});

router.post('/register', authController.register);
router.post('/login', authController.login);

// 保护的路由
router.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/user_dashboard.html'));
});

router.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/admin_dashboard.html'));
});

module.exports = router;
