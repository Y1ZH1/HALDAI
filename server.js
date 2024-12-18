// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const config = require('./config/config.json')

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 注册路由
app.use(authRoutes);

//启动服务
const currentDate = new Date();
app.listen(config.server_port, () => {
  console.log(`[${currentDate.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}] Server is running on port ${config.server_port}`);
});
