const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 设置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 处理文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  res.send(`File ${req.file.filename} uploaded successfully`);
});

// 列出所有文件
app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(files);
  });
});

// 下载文件
app.get('/files/:filename', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  const filePath = path.join(uploadDir, req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});