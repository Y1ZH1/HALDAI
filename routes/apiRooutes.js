const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const apiController = require('../controllers/apiController');
const path = require('path');

// api路由

// 获取用户信息
router.get('/get_user_info', authMiddleware.authenticateToken, apiController.get_user_info);
// 获取学校信息
router.get('/get_school_info', authMiddleware.authenticateToken, apiController.get_school_info);
// 设置用户信息
router.post('/set_user_info', authMiddleware.authenticateToken, apiController.set_user_info);
// 验证Token
router.post('/varify_token', apiController.varify_token);
// 退出登录
router.post('/log_out', apiController.log_out);
// 上传图片
router.post('/upload_images', authMiddleware.authenticateToken, uploadMiddleware.createUpload('images').array('images', 3), apiController.uploadImages);
// 获取上传的图片列表
router.get('/get_upload_img_list', authMiddleware.authenticateToken, apiController.get_upload_img_list);
// 关联学校信息
router.post('/link_schools', authMiddleware.authenticateToken, apiController.link_schools);

module.exports = router;