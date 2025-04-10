// controllers/postureController.js

const { JWT } = require('../middlewares/authMiddleware');
const mapping = require('../config/mapping.json');
const school = require('../config/school.json');
const db = require('../config/db');

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

const get_stu_posture_info = async (req, res) => {
    const { name, className } = req.body;
    try {
        const [stuinfo] = await db.promise().query('SELECT uuid, class, stu_name, stu_id, department, schoolcode FROM studata WHERE class = ? AND stu_name = ? AND schoolcode = ?',
            [className, name, req.managerSchoolCode]);
        const user = stuinfo[0];
        if (!user) {
            return res.status(200).json({ code: 3, message: '用户信息未找到' });
        }
        if (user.schoolcode != req.managerSchoolCode) {
            return res.status(401).json({ code: 2, message: '管理员权限不匹配' });
        }
        const [userdata] = await db.promise().query('SELECT gender, posture_info FROM userdata WHERE uuid = ?', [user.uuid]);
        if (!userdata[0]) {
            return res.status(200).json({ code: 3, message: '用户信息未找到' });
        }
        const [images] = await db.promise().query(
            'SELECT COUNT(*) AS file_count, GROUP_CONCAT(filename) AS filenames FROM submitfile WHERE uuid = ?',
            [user.uuid]);
        let imagedata = null;
        if (images[0]) {
            imagedata = {
                count: images[0].file_count,
                filenames: images[0].filenames ? images[0].filenames.split(',') : [],
                user_folder: user.uuid.split('-')[0]
            };
        }

        const userData = {
            userName: user.stu_name,
            userClass: user.class,
            userStid: user.stu_id,
            userDepartment: user.department,
            userSchool: school[user.schoolcode],
            userBody: userdata[0].posture_info,
            userGender: userdata[0].gender,
            userImg: imagedata,
            userUuid: user.uuid
        };

        return res.json({
            code: 1,
            message: '查询成功',
            data: userData
        });
    } catch (err) {
        console.error('管理员查询学生体态信息，数据库错误:', err);  // 打印详细错误信息
        return res.status(500).json({ code: 0, message: '数据库查询失败' });
    }
};

const get_global_posture_info = async (req, res) => {
    const { className, postureIssue, searchAll } = req.body;

    try {
        let query;
        let queryParams;

        if (searchAll) {
            // 如果勾选了“搜索全校”，则忽略班级条件
            if (postureIssue === null || postureIssue === undefined) {
                // 查询所有学生，不筛选体态问题
                query = `
                    SELECT s.stu_name, s.class, s.stu_id, s.department, s.schoolcode, u.posture_info
                    FROM studata s
                    LEFT JOIN userdata u ON s.uuid = u.uuid
                    WHERE s.schoolcode = ?
                `;
                queryParams = [req.managerSchoolCode];
            } else {
                // 查询所有学生，筛选体态问题
                query = `
                    SELECT s.stu_name, s.class, s.stu_id, s.department, s.schoolcode, u.posture_info
                    FROM studata s
                    LEFT JOIN userdata u ON s.uuid = u.uuid
                    WHERE u.posture_info LIKE ? AND s.schoolcode = ?
                `;
                queryParams = [`%${postureIssue}%`, req.managerSchoolCode];
            }
        } else {
            // 按班级筛选
            if (postureIssue === null || postureIssue === undefined) {
                // 仅按班级查询
                query = `
                    SELECT s.stu_name, s.class, s.stu_id, s.department, s.schoolcode, u.posture_info
                    FROM studata s
                    LEFT JOIN userdata u ON s.uuid = u.uuid
                    WHERE s.class = ? AND s.schoolcode = ?
                `;
                queryParams = [className, req.managerSchoolCode];
            } else {
                // 按班级和体态问题查询
                query = `
                    SELECT s.stu_name, s.class, s.stu_id, s.department, s.schoolcode, u.posture_info
                    FROM studata s
                    LEFT JOIN userdata u ON s.uuid = u.uuid
                    WHERE s.class = ? AND u.posture_info LIKE ? AND s.schoolcode = ?
                `;
                queryParams = [className, `%${postureIssue}%`, req.managerSchoolCode];
            }
        }

        // 执行数据库查询
        const [results] = await db.promise().query(query, queryParams);

        if (results.length === 0) {
            return res.status(404).json({ code: 0, message: '未找到匹配的学生信息' });
        }

        // 格式化返回的数据
        const studentData = results.map(student => ({
            name: student.stu_name,
            class: student.class,
            student_id: student.stu_id,
            department: student.department,
            body_info: student.posture_info
        }));

        return res.json({
            code: 1,
            message: '查询成功',
            data: studentData
        });
    } catch (err) {
        console.error('数据库查询失败:', err);
        return res.status(500).json({ code: 0, message: '数据库查询失败' });
    }
};

module.exports = {
    link_schools,
    get_posture_info,
    get_stu_posture_info,
    get_global_posture_info,
};