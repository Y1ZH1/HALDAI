// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 80;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 注册路由
app.use(authRoutes);

//启动服务
const currentDate = new Date();
app.listen(PORT, () => {
  console.log(`[${currentDate.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}] Server is running on port ${PORT}`);
});
