// controllers/authController.js

const { JWT } = require('../middlewares/authMiddleware');
const db = require('../config/db');

const get_user_info = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    // Token 验证
    try {
        if (token == undefined || !JWT.verifyToken(token)) {
            return res.status(401).json({ message: 'Token 无效' });
        }
    } catch (err) {
        console.error('Token 验证错误:', err);  // 打印更详细的错误信息
        return res.status(401).json({ message: 'Token 验证失败', error: err.message });
    }

    // 查询 token 对应的 uuid
    try {
        const [token_row] = await db.promise().query('SELECT uuid FROM userinfo WHERE token = ?', [token]);
        if (!token_row || token_row.length === 0 || token_row[0].uuid == undefined) {
            return res.status(401).json({ message: '未找到用户' });
        }

        // 查询用户数据
        const [userdatas] = await db.promise().query('SELECT uuid, userid, name, gender, school, birthDate, tel, schoolid FROM userdata WHERE uuid = ?', [token_row[0].uuid]);
        const user = userdatas[0];  // 获取第一个用户数据
        if (!user) {
            return res.status(404).json({ message: '用户信息未找到' });
        }

        // 计算年龄
        const birthDateStr = new Date(user.birthDate);
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDateStr.getFullYear() -
            ((currentDate.getMonth() < birthDateStr.getMonth()) ||
                (currentDate.getMonth() === birthDateStr.getMonth() && currentDate.getDate() < birthDateStr.getDate()));

        // 此处字段需和前端js中fields数组内的字段一致
        const userData = {
            userID: user.userid,
            userName: user.name,
            userGender: user.gender,
            userSchool: user.school,
            userAge: age,
            userTel: user.tel,
            userSchoolid: user.schoolid
        };

        res.json(userData);
    } catch (err) {
        console.error('Database error:', err);  // 打印详细错误信息
        return res.status(500).json({ message: '数据库查询失败', error: err.message });
    }
};

module.exports = {
    get_user_info
};
