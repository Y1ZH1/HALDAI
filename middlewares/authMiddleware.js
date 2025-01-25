// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require("../config/config.json");   //解密密钥

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
    token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        token = req.body.token;
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

//基础全局中间件
const preProc = (req, res, next) => {
    req.url = decodeURIComponent(req.url); // 解码 URL
    req.requestTime = new Date();   //添加请求到达时间
    req.requestLocalTime = req.requestTime.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    req.localTime = ( timestamp ) => { timestamp.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) };
    req.log_INFO = ( msg, time = req.requestLocalTime ) => { console.log(`INFO [${ time }]: ` + msg)};
    req.log_ERR = ( msg, error = '', time = req.requestLocalTime ) => { console.error(`ERR [${ time }]: ` + msg, error)};
    next();
}

module.exports = {
    JWT,
    authenticateToken,
    authenticateSession,
    preProc,
}
