// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const secret = "xawlttjc"   //解密密钥

const JWT = {
    createToken: (data, time) => {
        return jwt.sign(data, secret, { expiresIn: time })
    },
    verifyToken: (token) => {
        // 如果token过期或验证失败，将返回false
        try {
            return jwt.verify(token, secret)
        } catch (error) {
            return false
        }
    }
}

const authenticateToken = (req, res, next) => {
    // 从请求头中获取 token
    const token = req.headers['authorization']?.split(' ')[1];

    console.log('Token: ' + token);

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }
    // 使用封装后的 JWT.verifyToken 方法进行验证
    const user = JWT.verifyToken(token);
    if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;  // 将用户信息附加到请求中
    next();  // 继续处理请求
};

module.exports = {
    JWT,
    authenticateToken
}
