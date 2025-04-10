// controllers/fileController.js

const { JWT } = require('../middlewares/authMiddleware');
const mapping = require('../config/mapping.json');
const school = require('../config/school.json');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// 上传图片
const uploadImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ code: 0, message: '上传文件为空' });
    }
    try {
        // 遍历所有上传的文件，并插入数据库
        const insertPromises = req.files.map(file => {
            return db.promise().query(
                'INSERT INTO submitfile (uuid, fileinfo, filename, uploaddate) VALUES (?, ?, ?, ?)',
                [req.user.id, 'sp_img', file.filename, req.requestTime]
            );
        });

        // 等待所有插入操作完成
        await Promise.all(insertPromises);
    } catch (error) {
        req.log_ERR('数据库错误', error);
        res.status(500).json({ code: 0, message: '文件上传失败，请稍后再试' });
    }

    return res.status(200).json({ code: 1, message: '文件上传成功' }); s
};

const get_upload_img_list = async (req, res) => {
    try {
        // 执行查询
        const [results] = await db.promise().query(
            'SELECT COUNT(*) AS file_count, GROUP_CONCAT(filename) AS filenames FROM submitfile WHERE uuid = ?',
            [req.user.id]
        );
        // 检查查询结果是否为空
        if (!results || results.length === 0) {
            return res.status(200).json({
                code: 0,
                message: '无数据',
            });
        }
        // 返回查询结果
        return res.status(200).json({
            code: 1,
            message: '请求成功',
            data: {
                count: results[0].file_count,
                filenames: results[0].filenames ? results[0].filenames.split(',') : [],
                user_folder: req.user.id.split('-')[0]
            }
        });
    } catch (error) {
        req.log_ERR('数据库错误', error);
        // 返回服务器错误
        return res.status(500).json({
            code: 0,
            message: '查找失败'
        });
    }
};

const get_images = async (req, res) => {
    // TODO
};

// 返回头像
const get_avatar = (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            throw new Error('用户未认证');
        }

        const avatarPath = path.join(__dirname, '..', 'public/pic/avatars/', req.user.id.split('-')[0] + '.png');

        if (!fs.existsSync(avatarPath)) {
            throw new Error('头像不存在');
        }

        res.sendFile(avatarPath);
    } catch (err) {
        res.sendFile(path.join(__dirname, '..', 'public/pic/defaultAvatar.png'));
    }
}

// 返回体态图
const get_posture_img_path = (req, res) => {
        const posturePath = path.join(__dirname, '..', 'public/uploads',
            req.user.id.split('-')[0], 'images', req.query['n']);
        if (!fs.existsSync(posturePath)) {
            res.status(404).send('未找到图片');
        }
        res.sendFile(posturePath);
};

// 返回默认图片
const get_default_img = (req, res) => {
    const imgPath = path.join(__dirname, '..', 'public/pic', req.query['n'].split('/')[0]);
    if (!fs.existsSync(imgPath)) {
        res.status(404).send('未找到图片');
    }
    res.sendFile(imgPath);
};

module.exports = {
    uploadImages,
    get_upload_img_list,
    get_images,
    get_avatar,
    get_posture_img_path,
    get_default_img,
};