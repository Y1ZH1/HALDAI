// config/uploadConfig.js

const path = require('path');

module.exports = {
    // 通用配置
    maxFileSize: 5 * 1024 * 1024, // 5 MB
    allowedTypes: {
        images: ['image/jpeg', 'image/png', 'image/gif'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        videos: ['video/mp4', 'video/avi', 'video/mkv'],
        audio: ['audio/mpeg', 'audio/wav']
    },
    getUploadPath: (req, folder) => path.join(__dirname, `../public/uploads/${req.user.id.split('-')[0]}/${folder || 'default'}`),
    generateFileName: (req, file) => {
        const ext = path.extname(file.originalname);
        const baseName = req.body.filename || `file-${Date.now()}`;
        return `${baseName}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    }
};
