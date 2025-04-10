// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require("../config/config.json");   //解密密钥
const db = require('../config/db');

const JWT = {
    createToken: (data, time) => {
        return jwt.sign(data, config.JWT_key, { expiresIn: time })
    },
    verifyToken: (token) => {
        // 如果token过期或验证失败，将返回false
        try {
            return jwt.verify(token, config.JWT_key)
        } catch (error) {
            return false
        }
    }
}

const authenticateToken = (req, res, next) => {
    // 从请求中获取 token
    let token;
    token = req.headers['authorization']?.split(' ')[1];    //token在head中
    if (!token) {
        token = req.body.token;     //token在body中
    }
    if (!token) {
        token = req.session.isLogin ? req.session.token : null;   //请求中不手动携带token，则从session中获取
    }

    // 检查是否存在 token
    if (!token) {
        return res.status(401).json({ code: 0, message: '缺少 Token' });
    }

    try {
        // 验证Token
        const user = JWT.verifyToken(token);
        if (!user) {
            return res.status(401).json({ code: 0, message: 'Token 验证失败' });
        }
        req.user = user;  // 将用户信息附加到请求中
        next();  // 继续处理请求
    } catch (error) {
        console.error('Token 验证错误:', error);
        return res.status(401).json({ code: 0, message: 'Token 验证失败' });
    }
};

//通过session验证登录状态
const authenticateSession = (req, res, next) => {
    if (!req.session.isLogin) {
        return res.redirect('/login');
    }
    //获取 session 中的 Token 并验证
    const userinfo = JWT.verifyToken(req.session.token);
    if (!userinfo) {
        return res.redirect('/login');
    }
    next();
};

//验证学校管理员
const authSchoolManager = async (req, res, next) => {
    // 该中间件需在 token 验证之后使用
    try {
        const [managerInfo] = await db.promise().query('SELECT schoolcode FROM managerdata WHERE uuid = ?', [req.user.id]);
        if (!managerInfo[0]) {
            return res.status(401).message('未查询到管理员信息');
        }
        req.managerSchoolCode = managerInfo[0].schoolcode;
        next();
    } catch (err) {
        return res.status(401).message('该用户非管理员');
    }
};

//比对管理员和其试图操作的学生uuid是否为同一学校
const authSchoolCode = async (req, res, next) => {
    if (req.headers['uuid']) {
        uuid = req.headers['uuid'];
        const [stu] = await db.promise().query('SELECT schoolcode FROM studata WHERE uuid = ?', [uuid]);
        if (!stu[0]) { 
            return res.status(400).json({ code: 0, message: '该学生不存在' }); 
        }
        if (stu[0].schoolcode != req.managerSchoolCode) { 
            return res.status(401).json({ code: 0, message: '用户权限错误' }); 
        }
        req.schoolCodeAuthPassed = true;
        req.user.id = uuid;
        next();
    } else {
        return res.status(400).json({ code: 0, message: '缺少 uuid' });
    }
};

//基础全局中间件
const preProc = (req, res, next) => {
    req.url = decodeURIComponent(req.url); // 解码 URL
    req.requestTime = new Date();   //添加请求到达时间
    req.requestLocalTime = req.requestTime.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    req.localTime = (timestamp) => { timestamp.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) };
    req.client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '未取得IP';
    req.log_INFO = (msg, ip = req.client_ip, time = req.requestLocalTime) => { console.log(`INFO [${ip}] [${time}]: ` + msg) };
    req.log_ERR = (msg, error = '', ip = req.client_ip, time = req.requestLocalTime) => { console.error(`ERR [${ip}] [${time}]: ` + msg, error) };
    next();
}

module.exports = {
    JWT,
    authenticateToken,
    authenticateSession,
    authSchoolManager,
    authSchoolCode,
    preProc,
}
