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
    if (req.method === 'GET') {
        token = req.headers['authorization']?.split(' ')[1];
    } else if (req.method === 'POST') {
        token = req.body.token;
    } else {
        return res.status(401).json({ message: '无效的请求' });
    }

    // 检查是否存在 token
    if (!token) {
        return res.status(401).json({ message: '缺少 Token' });
    }

    try {
        // 验证Token
        const user = JWT.verifyToken(token);
        if (!user) {
            return res.status(401).json({ message: 'Token 验证失败' });
        }
        req.user = user;  // 将用户信息附加到请求中
        next();  // 继续处理请求
    } catch (error) {
        console.error('Token 验证错误:', error);
        return res.status(401).json({ message: 'Token 验证失败' });
    }
};


module.exports = {
    JWT,
    authenticateToken
}
