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
            return res.status(404).json({ code: 0, message: '用户信息未找到' });
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

        return res.json({
            code: 1,
            message: '查询成功',
            data: userData
        });
    } catch (err) {
        console.error('Database error:', err);  // 打印详细错误信息
        return res.status(500).json({ code: 0, message: '数据库查询失败' });
    }
};

// 设置用户数据
const set_user_info = async (req, res) => {
    try {
        // 校验请求参数
        if (!req.body.field || !req.body.value || !req.user.id) {
            return res.status(400).json({ code: 0, message: '请求参数不完整' });
        }

        // 映射合法字段
        const field = mapping.userdate_sql[req.body.field];
        if (!field) {
            return res.status(400).json({ code: 0, message: '无效的字段' });
        }

        // 查询用户数据
        const selectQuery = `SELECT ${field} FROM userdata`;
        const userdata = await db.promise().query(selectQuery);

        if (!userdata[0] || userdata[0].length === 0) {
            return res.status(404).json({ code: 0, message: '该数据项未找到' });
        }

        // 更新用户数据
        const updateQuery = `UPDATE userdata SET ${field} = ? WHERE uuid = ?`;
        const result = await db.promise().query(updateQuery, [req.body.value, req.user.id]);

        if (!result[0] || result[0].affectedRows === 0) {
            return res.status(400).json({ code: 0, message: '更新失败' });
        }

        return res.status(200).json({ code: 1, message: '更新成功' });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({ code: 0, message: '数据库错误，修改失败' });
    }
};

// 骨骼点图片
const set_photo = async (req, res) => {
    const [userdatas] = await db.promise().query('SELECT  submissionid data FROM sub WHERE uuid = ?', [req.user.id]);
    const user = userdatas[0];

}

// 验证Token
const varify_token = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ code: 0, valid: false, message: 'Token未提供' });
    }
    const userinfo = JWT.verifyToken(token);
    if (!userinfo) {
        return res.status(401).json({ code: 0, valid: false, message: 'Token 无效或已过期' });
    }
    //Token 有效
    try {
        const [results] = await db.promise().query('SELECT type FROM userinfo WHERE uuid = ?', [userinfo.id]);
        // 防止服务端重启后会话丢失 token 还在导致循环跳转，重新添加会话
        if (!req.session.isLogin) {
            req.session.isLogin = true;
            req.session.token = token;
            req.session.type = results[0].type;
        }
        return res.json({ code: 1, valid: true, message: '验证成功', type: results[0].type });
    } catch (error) {
        return res.json({ code: 0, valid: false, message: '查询失败' });
    }
};

// 退出登录，清空session
const log_out = (req, res) => {
    if (!req.session.isLogin) {
        return res.status(200).json({ code: 0, message: '未登录或会话已过期' });
    }
    req.session.destroy();
    return res.status(200).json({ code: 1, message: '退出登录成功' });
};

// 上传图片
const uploadImages = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ code: 0, message: '上传文件为空' });
    }
    try {
        // 遍历所有上传的文件，并插入数据库
        const insertPromises = req.files.map(file => {
            return db.promise().query(
                'INSERT INTO submitfile (uuid, fileinfo, filename, uploaddate) VALUES (?, ?, ?, ?)',
                [req.user.id, 'sp_img', file.filename, req.requestTime]
            );
        });

        // 等待所有插入操作完成
        await Promise.all(insertPromises);
    } catch (error) {
        console.error('数据库插入失败:', error);
        res.status(500).json({ code: 0, message: '文件上传失败，请稍后再试' });
    }

    return res.status(200).json({ code: 1, message: '文件上传成功' });s
};

module.exports = {
    get_user_info,
    set_user_info,
    varify_token,
    log_out,
    uploadImages,
};
