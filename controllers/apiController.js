// controllers/authController.js

const { JWT } = require('../middlewares/authMiddleware');
const mapping = require('../config/mapping.json');
const db = require('../config/db');

// 查询用户数据
const get_user_info = async (req, res) => {
    try {
        const [userdatas] = await db.promise().query('SELECT name, gender, school, birthDate, tel, schoolid FROM userdata WHERE uuid = ?', [req.user.id]);
        const user = userdatas[0];
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
            userID: req.user.username,
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
        return res.status(500).json({ message: '数据库查询失败' });
    }
};

// 设置用户数据
const set_user_info = async (req, res) => {
    try {
        // 校验请求参数
        if (!req.body.field || !req.body.value || !req.user.id) {
            return res.status(400).json({ message: '请求参数不完整' });
        }

        // 映射合法字段
        const field = mapping.userdate_sql[req.body.field];
        if (!field) {
            return res.status(400).json({ message: '无效的字段' });
        }

        // 查询用户数据
        const selectQuery = `SELECT ${field} FROM userdata`;
        const userdata = await db.promise().query(selectQuery);

        if (!userdata[0] || userdata[0].length === 0) {
            return res.status(404).json({ message: '该数据项未找到' });
        }

        // 更新用户数据
        const updateQuery = `UPDATE userdata SET ${field} = ? WHERE uuid = ?`;
        const result = await db.promise().query(updateQuery, [req.body.value, req.user.id]);

        if (!result[0] || result[0].affectedRows === 0) {
            return res.status(400).json({ message: '更新失败' });
        }

        return res.status(200).json({ message: '更新成功' });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: '修改失败' });
    }
};
const set_photo = async (req, res) =>{
    const [userdatas] = await db.promise().query('SELECT  submissionid data FROM sub WHERE uuid = ?', [req.user.id]);
    const user = userdatas[0];
    
}

// 验证Token
const varify_token = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token未提供' });
    }

    if (JWT.verifyToken(token)) {
        res.json({ valid: true });
    } else {
        res.status(401).json({ valid: false, message: '无效的Token' });
    }
};

module.exports = {
    get_user_info,
    set_user_info,
    varify_token
};
