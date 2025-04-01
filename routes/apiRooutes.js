const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const apiController = require('../controllers/apiController');
const path = require('path');

// api路由

// 获取用户信息
router.get('/get_user_info', authMiddleware.authenticateToken, apiController.get_user_info);
// 获取管理员信息
router.get('/get_manager_info', authMiddleware.authenticateToken, apiController.get_manager_info);
// 设置用户信息
router.post('/set_user_info', authMiddleware.authenticateToken, apiController.set_user_info);
// 设置管理员信息
router.post('/set_manager_info', authMiddleware.authenticateToken, apiController.set_manager_info);
// 关联学校信息
router.post('/link_schools', authMiddleware.authenticateToken, apiController.link_schools);
// 用户查询体态信息
router.post('/get_posture_info', authMiddleware.authenticateToken, apiController.get_posture_info);

// 验证Token
router.post('/varify_token', apiController.varify_token);
// 退出登录
router.post('/log_out', apiController.log_out);

// 上传图片
router.post('/upload_images', authMiddleware.authenticateToken, uploadMiddleware.createUpload('images').array('images', 3), apiController.uploadImages);
// 获取上传的图片列表
router.get('/get_upload_img_list', authMiddleware.authenticateToken, apiController.get_upload_img_list);
// 获取图片
router.post('/get_images', authMiddleware.authenticateToken, apiController.get_images);

// 管理员查询学生体态信息
router.post('/get_stu_posture_info', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, apiController.get_stu_posture_info);
// 管理员批量查询体态信息
router.post('/get_global_posture_info', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, apiController.get_global_posture_info);
// 管理员上传学生体态图片
router.post('/upload_stu_images', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, authMiddleware.authSchoolCode, uploadMiddleware.createUpload('images').array('images', 3), apiController.uploadImages);
// 批量创建学生账号
router.post('/create_account', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, apiController.create_account);

module.exports = router;