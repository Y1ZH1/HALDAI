// controllers/authController.js

const { JWT } = require('../middlewares/authMiddleware');
const mapping = require('../config/mapping.json');
const school = require('../config/school.json');
const db = require('../config/db');
const { ReceiptEuro, SchoolIcon } = require('lucide-react');
const { generateFileName } = require('../config/upload');

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
        req.log_ERR('数据库错误', error);
        res.status(500).json({ code: 0, message: '文件上传失败，请稍后再试' });
    }

    return res.status(200).json({ code: 1, message: '文件上传成功' }); s
};

const get_upload_img_list = async (req, res) => {
    try {
        // 执行查询
        const [results] = await db.promise().query(
            'SELECT COUNT(*) AS file_count, GROUP_CONCAT(filename) AS filenames FROM submitfile WHERE uuid = ?',
            [req.user.id]
        );
        // 检查查询结果是否为空
        if (!results || results.length === 0) {
            return res.status(200).json({
                code: 0,
                message: '无数据',
            });
        }
        // 返回查询结果
        return res.status(200).json({
            code: 1,
            message: '请求成功',
            data: {
                count: results[0].file_count,
                filenames: results[0].filenames ? results[0].filenames.split(',') : [],
                user_folder: req.user.id.split('-')[0] 
            }
        });
    } catch (error) {
        req.log_ERR('数据库错误', error);
        // 返回服务器错误
        return res.status(500).json({
            code: 0,
            message: '查找失败'
        });
    }
};

const link_schools = (req, res) => {
    if (req.body.linkType == 'link') {
        return res.json({ code: 1, message: '申请成功，请等待管理员通过' });
    } else if (req.body.linkType == 'quit') {
        return res.json({ code: 1, message: '申请退出成功，请等待管理员通过' });
    } else {
        return res.status(404);
    }
};

const get_posture_info = async (req, res) => {
    let userData;
    try {
        const [user] = await db.promise().query('SELECT name, gender, birthDate, islinkedschool, tel, posture_info FROM userdata WHERE uuid = ?', [req.user.id]);
        if (!user[0]) {
            return res.status(404).json({ code: 0, message: '用户信息未找到' });
        }
        if (user[0].islinkedschool == '0') {
            userData = {
                userName: user[0].name,
                userBody: user[0].posture_info,
                userGender: user[0].gender
            };
        } else {
            const [studatas] = await db.promise().query('SELECT stu_name, department, class, stu_id, schoolcode FROM studata WHERE uuid = ? ', [req.user.id]);
            const stu = studatas[0];
            if (!stu) {
                return res.status(404).json({ code: 0, message: '用户信息未找到' });
            }

            userData = {
                userName: stu.stu_name,
                userClass: stu.class,
                userStid: stu.stu_id,
                userDepartment: stu.department,
                userSchool: school[stu.schoolcode],
                userBody: user[0].posture_info,
                userGender: user[0].gender
            };
        }

        return res.json({
            code: 1,
            message: '查询成功',
            data: userData
        });
    } catch (err) {
        req.log_ERR('体态信息查询，数据库错误', err);
        return res.status(500).json({ code: 0, message: '数据库查询失败' });
    }
};

const get_images = async (req, res) => {
    // TODO
};

module.exports = {
    get_user_info,
    get_manager_info,
    set_user_info,
    varify_token,
    log_out,
    uploadImages,
    get_upload_img_list,
    link_schools,
    get_posture_info,
    get_images,
};
