// routes/authRoutes.js
const express = require('express');
const db = require('../config/db');
const router = express.Router();
const authController = require('../controllers/authController');
const apiController = require('../controllers/apiController');
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

router.get('/manager', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/manager_dashboard.html'));
});

//api路由

//获取用户信息
router.get('/api/get_user_info', authenticateToken, apiController.get_user_info);
//设置用户信息
router.post('/api/set_user_info', authenticateToken, apiController.set_user_info);
//验证Token
router.post('/api/varify_token', apiController.varify_token);

//404路由
router.get('/*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '..', 'public/404.html'));
  })

module.exports = router;
