// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const rootRoutes = require('./routes/rootRoutes');
const apiRoutes = require('./routes/apiRooutes');
const { defaultErrPage, notFoundPage } = require('./middlewares/errMiddleware');
const { preProc } = require('./middlewares/authMiddleware');
const config = require('./config/config.json');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(cors());
app.use(session(config.session_config));

app.use(preProc);
app.use(express.static(path.join(__dirname, 'public')));

// 注册路由
app.use('/', rootRoutes);
app.use('/api', apiRoutes);

//捕获错误
app.use(defaultErrPage);
app.use(notFoundPage);

//启动服务
const currentDate = new Date();
app.listen(config.server_port, () => {
  console.log(`[${currentDate.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}] Server is running on port ${config.server_port}`);
});
