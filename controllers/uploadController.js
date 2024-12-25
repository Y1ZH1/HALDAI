const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const router = express.Router();
// 配置Multer存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/photo/'); // 确保这个目录存在并且有写权限
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname)); // 使用UUID和原始文件扩展名作为文件名
    }
});

const upload = multer({ storage: storage });

// 图片上传接口
router.post('/api/upload', upload.single('image'), async (req, res) => {
    const { uuid } = req.body; //uuid获取
    const file = req.file;
    const filePath = '/photo/' + file.filename; // 构建文件路径

    try {
        // 插入记录到sub表
        await db.promise().query('INSERT INTO sub (uuid, path) VALUES (?, ?)', [uuid, filePath]);
        res.json({ message: '图片上传成功' });
    } catch (err) {
        console.error('上传图片错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router;