const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const apiController = require('../controllers/apiController');
const path = require('path');

// api路由

// 获取用户信息
router.get('/get_user_info', authenticateToken, apiController.get_user_info);
// 设置用户信息
router.post('/set_user_info', authenticateToken, apiController.set_user_info);
// 验证Token
router.post('/varify_token', apiController.varify_token);
// 退出登录
router.post('/log_out', apiController.log_out);

module.exports = router;