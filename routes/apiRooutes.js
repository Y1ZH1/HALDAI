const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');

const userController = require('../controllers/userController');
const fileController = require('../controllers/fileController');
const postureController = require('../controllers/postureController');

const path = require('path');

// api路由

// 获取用户信息
router.get('/get_user_info', authMiddleware.authenticateToken, userController.get_user_info);
// 获取管理员信息
router.get('/get_manager_info', authMiddleware.authenticateToken, userController.get_manager_info);
// 设置用户信息
router.post('/set_user_info', authMiddleware.authenticateToken, userController.set_user_info);
// 设置管理员信息
router.post('/set_manager_info', authMiddleware.authenticateToken, userController.set_manager_info);
// 关联学校信息
router.post('/link_schools', authMiddleware.authenticateToken, postureController.link_schools);
// 用户查询体态信息
router.post('/get_posture_info', authMiddleware.authenticateToken, postureController.get_posture_info);
// 上传头像
router.post('/upload_images', authMiddleware.authenticateToken, uploadMiddleware.createUpload('avatar').array('avatar', 1));

// 验证Token
router.post('/varify_token', userController.varify_token);
// 退出登录
router.post('/log_out', userController.log_out);

// 上传体态图片
router.post('/upload_images', authMiddleware.authenticateToken, uploadMiddleware.createUpload('images').array('images', 3), fileController.uploadImages);
// 获取上传的图片列表
router.get('/get_upload_img_list', authMiddleware.authenticateToken, fileController.get_upload_img_list);
// 获取图片
router.post('/get_images', authMiddleware.authenticateToken, fileController.get_images);

// 管理员查询学生体态信息
router.post('/get_stu_posture_info', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, postureController.get_stu_posture_info);
// 管理员批量查询体态信息
router.post('/get_global_posture_info', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, postureController.get_global_posture_info);
// 管理员上传学生体态图片
router.post('/upload_stu_images', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, authMiddleware.authSchoolCode, uploadMiddleware.createUpload('images').array('images', 3), fileController.uploadImages);
// 批量创建学生账号
router.post('/create_account', authMiddleware.authenticateToken, authMiddleware.authSchoolManager, userController.create_account);

module.exports = router;