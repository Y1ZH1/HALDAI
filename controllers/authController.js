// controllers/authController.js

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { JWT } = require('../middlewares/authMiddleware');
const db = require('../config/db');
const config = require('../config/config.json');

// 注册接口

const register = async (req, res) => {
    const created_at = new Date(); // 获取当前时间戳
    req.log_INFO('收到注册请求', req.localTime(created_at));

    // 从请求体中获取数据
    const { name, username, password, confirmPassword, gender, phone, birthdate } = req.body;

    // 检查密码和确认密码是否一致
    if (password !== confirmPassword) {
        return res.status(400).json({ code: 0, message: '密码和确认密码不一致' });
    }

    // 验证出生日期是否合法
    const date = new Date(birthdate);
    if (isNaN(date)) {
        return res.status(400).json({ code: 0, message: '无效的出生日期格式' });
    }

    try {
        // 检查用户名是否已存在
        const [results] = await db.promise().query('SELECT * FROM userinfo WHERE username = ?', [username]);
        if (results.length > 0) {
            return res.status(400).json({ code: 0, message: '用户名已存在' });
        }

        // 生成 UUID
        const uuid = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10); //密码哈希处理

        // 如果没有提供姓名，则使用部分 UUID 作为用户名
        const endname = name === '' ? '用户' + uuid.split('-')[0] : name;

        // 处理性别
        let sex = '未设置';
        if (gender !== 'none') {
            sex = gender === 'male' ? '男' : '女';
        }

        // 插入用户认证信息
        await db.promise().query(
            'INSERT INTO userinfo (uuid, username, password, created_at, enable) VALUES (?, ?, ?, ?)',
            [uuid, username, hashedPassword, created_at, 1]
        );

        // 插入用户数据
        await db.promise().query(
            'INSERT INTO userdata (uuid, userid, name, gender, tel, birthdate) VALUES (?, ?, ?, ?, ?, ?)',
            [uuid, username, endname, sex, phone, date]
        );

        console.log(`INFO: 用户"${username}"注册成功，UUID为${uuid}`);
        return res.status(201).json({ code: 1, message: '用户注册成功' });
    } catch (err) {
        req.log_ERR('注册错误', err);
        return res.status(500).json({ code: 0, message: '服务器错误' });
    }
};

// 登录接口
const login = async (req, res) => {
    const { username, password } = req.body;
    const last_login = new Date(); // 获取当前时间戳
    req.log_INFO(`收到用户“${username}”的登录请求`, req.localTime(last_login));

    try {
        const [results] = await db.promise().query('SELECT * FROM userinfo WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(401).json({ code: 0, message: '用户不存在' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!user.enable) {
            return res.status(401).json({ code: 0, message: '该账号未启用，请联系管理员' });
        }
        if (!isMatch) {
            return res.status(401).json({ code: 0, message: '密码错误' });
        }

        const token = JWT.createToken({ id: user.uuid, username: user.username }, config.login_expire_time);
        // 更新最后登录时间
        await db.promise().query('UPDATE userinfo SET last_login = ?, token = ? WHERE username = ?', [last_login, token, username]);
        console.log(`INFO: 用户“${username}”登录成功`);
        // 更新 session
        req.session.isLogin = true;
        req.session.token = token;
        req.session.type = user.type;

        return res.send({ code: 1, msg: '登录成功', data: { token }, type: user.type })
    } catch (err) {
        req.log_ERR('登录错误', err);
        return res.status(500).json({ code: 0, message: '登录错误' });
    }
};

module.exports = {
    register,
    login,
};
