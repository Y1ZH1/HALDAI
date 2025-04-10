// routes/rootRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');

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

// 头像路径
router.get('/avatar', authMiddleware.authenticateToken, fileController.get_avatar);
// 体态图片路径
router.get('/postureImg', authMiddleware.authenticateToken, fileController.get_posture_img_path);
// 默认路径
router.get('/i', fileController.get_default_img);

module.exports = router;
