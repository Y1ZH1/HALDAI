// controllers/authController.js
const bcrypt = require('bcryptjs');
const { JWT } = require('../middlewares/authMiddleware');
const db = require('../config/db');

// 注册接口
const register = async (req, res) => {
    console.log("INFO: 收到注册请求"); // 确认服务器收到了请求
    const { username, password } = req.body;
    try {
        const [results] = await db.promise().query('SELECT * FROM userinfo WHERE username = ?', [username]);
        if (results.length > 0) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query('INSERT INTO userinfo (username, password) VALUES (?, ?)', [username, hashedPassword]);

        console.log(`INFO: 用户“${username}”注册成功`);
        res.status(201).json({ message: '用户注册成功' });
    } 
    catch (err) {
        res.status(500).json({ message: '服务器错误' });
    }
};

// 登录接口
const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`INFO: 收到用户“${username}”的登录请求`);

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

        console.log(`INFO: 用户“${username}”登录成功`);
        const token = JWT.createToken({ id: user.id, username: user.username }, '1h');
        res.send({ code: 200, msg: '登录成功', data: { token } })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '服务器错误' });
    }
};

module.exports = {
    register,
    login
};
