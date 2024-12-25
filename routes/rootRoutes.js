// routes/rootRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authenticateSession } = require('../middlewares/authMiddleware');
const path = require('path');
const { error } = require('console');

// 注册和登录路由
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/register.html'));
});

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/login.html'));
});

router.post('/register', authController.register);

router.post('/login', authController.login);

// 面板主页路由
router.get('/user', authenticateSession, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/user_dashboard.html'));
});

router.get('/manager', authenticateSession, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/manager_dashboard.html'));
});

module.exports = router;
