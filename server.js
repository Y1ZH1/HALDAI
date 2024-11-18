// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

// const debug = require('debug')('app:token');  // 为 token 相关的部分设置调试标签

const app = express();
const PORT = 5302;

// 验证 token 的中间件
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];  // 从 Authorization 头部提取 token
  console.log('Token from Authorization header:', token);   //DEBUG
  console.log('Authorization header:', req.headers['authorization']);

  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid token' }); // 返回 401 错误
  }

  // 验证 token 是否有效
  jwt.verify(token, 'xawlttjc', (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' }); // 返回 401 错误
    }
    
    req.user = user;  // 将验证通过的用户信息附加到请求对象中
    next();  // 如果验证通过，继续处理请求
  });
};



// 注册页面
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
}); 

// 登录页面
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
}); 

// 保护的 /dashboard 页面，只有经过身份验证的用户才能访问
app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(__dirname + '/public/dashboard.html');
}); 

// 创建 MySQL 连接池
const db = mysql.createPool({
  host: '172.29.160.151',
  user: 'mydb',
  password: 'zRDfAEEMGChfx4K8',
  database: 'mydb'
});

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

// 注册接口
app.post('/register', async (req, res) => {
  console.log("收到注册请求"); // 确认服务器收到了请求
  const { username, password } = req.body;
  try {
    // 检查用户名是否已存在
    const [results] = await db.promise().query('SELECT * FROM userinfo WHERE username = ?', [username]);
    if (results.length > 0) {
      return res.status(400).json({ message: '用户名已存在' }); 
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新用户
    await db.promise().query('INSERT INTO userinfo (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(201).json({ message: '用户注册成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 登录接口
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [results] = await db.promise().query('SELECT * FROM userinfo WHERE username = ?', [username]);

    if (results.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: '密码错误' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'xawlttjc', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
