// middlewares/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getUploadPath, allowedTypes, maxFileSize, generateFileName } = require('../config/upload');
const mapping = require('../config/mapping.json');

// 文件类型过滤器
const fileFilter = (type) => (req, file, cb) => {
    if (allowedTypes[type].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`非法的文件类型： ${type}.`));
    }
};

// 配置存储
const storage = (type) => multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = mapping.uploadPath[req.body.uploadType];
        const uploadPath = getUploadPath(req, folder || type); // 根据上传类型决定文件夹
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // 创建文件夹
        }
        cb(null, uploadPath); // 设置上传路径
    },
    filename: (req, file, cb) => {
        const newFileName = generateFileName(req, file); // 使用通用文件命名方法
        cb(null, newFileName); // 设置文件名
    }
});

// 创建上传方法
const createUpload = (type) => {
    return multer({
        storage: storage(type),
        limits: { fileSize: maxFileSize },
        fileFilter: fileFilter(type)
    });
};

const set_upload_path = (req, res, next) => {
    const upType = req.header['upload_type'];
    if (!upType) {
        req.uploadPath = path.join(__dirname, '../uploads/default');
    } else if (upType == 'posture') {
        req.uploadPath = path.join(__dirname, `../public/uploads/${req.user.id.split('-')[0]}/${folder || 'default'}`)
    }
};

module.exports = {
    createUpload,
};
