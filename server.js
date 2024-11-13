// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
const PORT = 80;

// 创建 MySQL 连接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'mydb'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

app.use(bodyParser.json());
app.use(cors());

app.use(express.static('public'));

// 注册接口
app.post('http://localhost/register', async (req, res) => {
  const { username, password } = req.body;
  //下面一行为我自己添加的内容
  res.status(201).json({ message: '用户注册成功' });
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