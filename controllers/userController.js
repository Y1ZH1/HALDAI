// controllers/userController.js

const { JWT } = require('../middlewares/authMiddleware');
const mapping = require('../config/mapping.json');
const school = require('../config/school.json');
const db = require('../config/db');

// 查询用户数据
const get_user_info = async (req, res) => {
    try {
        const [userdatas] = await db.promise().query('SELECT name, gender, birthDate, islinkedschool, tel FROM userdata WHERE uuid = ?', [req.user.id]);
        const user = userdatas[0];
        if (!user) {
            return res.status(404).json({ code: 0, message: '用户信息未找到' });
        }
        let schoolinfo = null;
        if (user.islinkedschool == '1') {
            const [schooldatas] = await db.promise().query('SELECT schoolcode, stu_id, class FROM studata WHERE uuid = ?', [req.user.id]);
            schoolinfo = schooldatas[0];
            if (!schoolinfo) {
                return res.status(404).json({ code: 0, message: '学校信息未找到' });
            }
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
            userSchool: schoolinfo ? school[schoolinfo.schoolcode] : null,
            userAge: age,
            userTel: user.tel,
            userSchoolid: schoolinfo ? schoolinfo.stu_id : null
        };

        let schoolData = null;
        if (schoolinfo) {
            schoolData = {
                username: user.name,
                schoolName: school[schoolinfo.schoolcode],
                schoolID: schoolinfo.stu_id,
                class: schoolinfo.class,
                schoolCode: schoolinfo.schoolcode
            };
        }

        return res.json({
            code: 1,
            message: '查询成功',
            data: userData,
            schooldata: schoolData
        });
    } catch (error) {
        req.log_ERR('查询用户信息数据库错误', error);
        return res.status(500).json({ code: 0, message: '数据库查询失败' });
    }
};

// 查询管理员数据
const get_manager_info = async (req, res) => {
    try {
        const [managerdatas] = await db.promise().query('SELECT name, tel, schoolcode, email FROM managerdata WHERE uuid = ?', [req.user.id]);
        const managerdata = managerdatas[0];
        if (!managerdata) {
            return res.status(404).json({ code: 0, message: '用户信息未找到' });
        }

        const managerData = {
            userName: managerdata.name,
            userID: req.user.username,
            userSchool: school[managerdata.schoolcode],
            userTel: managerdata.tel,
            userEmail: managerdata.email
        };

        return res.json({
            code: 1,
            message: '查询成功',
            data: managerData
        });
    } catch (error) {
        req.log_ERR('查询管理员信息数据库错误', error);
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
    } catch (error) {
        req.log_ERR('数据库错误', error);
        return res.status(500).json({ code: 0, message: '数据库错误，修改失败' });
    }
};

// 设置管理员数据
const set_manager_info = async (req, res) => {
    try {
        // 校验请求参数
        if (!req.body.field || !req.body.value || !req.user.id) {
            return res.status(400).json({ code: 0, message: '请求参数不完整' });
        }
        console.log(req.body.field);
        // 映射合法字段
        const field = mapping.managerdata_sql[req.body.field];
        if (!field) {
            return res.status(400).json({ code: 0, message: '无效的字段' });
        }

        // 查询用户数据
        const selectQuery = `SELECT ${field} FROM managerdata`;
        const userdata = await db.promise().query(selectQuery);

        if (!userdata[0] || userdata[0].length === 0) {
            return res.status(404).json({ code: 0, message: '该数据项未找到' });
        }

        // 更新用户数据
        const updateQuery = `UPDATE managerdata SET ${field} = ? WHERE uuid = ?`;
        const result = await db.promise().query(updateQuery, [req.body.value, req.user.id]);

        if (!result[0] || result[0].affectedRows === 0) {
            return res.status(400).json({ code: 0, message: '更新失败' });
        }

        return res.status(200).json({ code: 1, message: '更新成功' });
    } catch (error) {
        req.log_ERR('数据库错误', error);
        return res.status(500).json({ code: 0, message: '数据库错误，修改失败' });
    }
};

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
        const [results] = await db.promise().query('SELECT type, avatar FROM userinfo WHERE uuid = ?', [userinfo.id]);
        // 防止服务端重启后会话丢失 token 还在导致循环跳转，重新添加会话
        if (!req.session.isLogin) {
            req.session.isLogin = true;
            req.session.token = token;
            req.session.type = results[0].type;
        }
        return res.json({
            code: 1, 
            valid: true,
            message: '验证成功',
            type: results[0].type,
            username: userinfo.username, });
    } catch (error) {
        req.log_ERR('数据库错误', error);
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

const create_account = (req, res) => {
    // const data = req.body;
    // data.forEach(person => {
    //     const { 姓名: name, 身份证号码: id_card } = person; // 解构赋值

    //     const sql = 'INSERT INTO stutemp (name, id_card) VALUES (?, ?)';
    //     db.query(sql, [name, id_card], (err, result) => {
    //         if (err) {
    //             console.error('数据库插入失败:', err);
    //             return res.status(500).json({ code: 0, message: '数据插入失败' });
    //         }
    //         console.log('数据插入成功:', result);
    //     });
    // });
    return res.json({ code: 1, message: '成功' });
};

module.exports = {
    get_user_info,
    get_manager_info,
    set_user_info,
    set_manager_info,
    varify_token,
    log_out,
    create_account,
};