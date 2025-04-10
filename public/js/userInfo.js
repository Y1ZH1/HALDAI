import { activeModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // 从 localStorage 获取 token
    // 如果没有 token，直接返回
    if (!token) {
        console.error('未找到token');
        window.parent.location.href = '/login';
        return;
    }

    const fields = {
        userName: document.getElementById('username'),
        userID: document.getElementById('id'),
        userGender: document.getElementById('gender'),
        userSchool: document.getElementById('school'),
        userAge: document.getElementById('age'),
        userTel: document.getElementById('tel'),
        userSchoolid: document.getElementById('sch-id')
    };

    const schoolInfoFields = {
        username: document.getElementById('school-info-name'),
        schoolName: document.getElementById('school-info-school'),
        class: document.getElementById('school-info-class'),
        schoolID: document.getElementById('school-info-sch-id'),
    };

    // 获取用户信息
    fetchUserInfo(fields, schoolInfoFields, token);

    const editBtn = document.querySelectorAll('.action-button')[0]; // 编辑信息按钮
    const schoolBtn = document.querySelectorAll('.action-button')[1]; // 学校管理按钮
    const notificationBtn = document.querySelectorAll('.action-button')[2]; // 通知提醒按钮

    const editModal = document.getElementById('edit-modal');
    const closeEditModalBtn = document.getElementById('close-modal');
    const submitButtons = document.querySelectorAll('.submit-btn');

    const schoolModal = document.getElementById('school-modal');
    const closeSchoolModalBtn = document.getElementById('close-school-modal');

    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationModalBtn = document.getElementById('close-notification-modal');
    const fullNotificationModal = document.getElementById('full-notification-modal');
    const closeFullNotificationModalBtn = document.getElementById('close-full-notification-modal');
    const notificationPreviews = document.querySelectorAll('.notification-preview');
    const viewFullBtns = document.querySelectorAll('.view-full-btn');

    const linkSchoolBtn = document.getElementById('linkSchool-btn');
    const quitSchoolBtn = document.getElementById('quitSchool-btn');
    const linkschoolModal = document.getElementById('linkschool-modal');
    const quitschoolModal = document.getElementById('quitschool-modal');
    const closeLinkcshoolBtn = document.getElementById('close-linkcshool-modal-btn');
    const closeQuitschoolBtn = document.getElementById('close-quitschool-modal-btn');

    // 开关编辑信息交互框
    activeModal(editBtn, closeEditModalBtn, editModal, 300);
    // 开关学校管理交互框
    activeModal(schoolBtn, closeSchoolModalBtn, schoolModal, 350);
    // 开关通知提醒交互框
    activeModal(notificationBtn, closeNotificationModalBtn, notificationModal, 300);

    // 开关完整通知内容交互框
    viewFullBtns.forEach((btn, index) => {
        const openFullNotification = () => {
            const title = notificationPreviews[index].querySelector('strong').textContent;
            const content = notificationPreviews[index].querySelector('p').textContent;
            // 设置完整通知的标题和内容
            document.getElementById('notification-title').textContent = title;
            document.getElementById('notification-content').textContent = content;
        };
        activeModal(btn, closeFullNotificationModalBtn, fullNotificationModal, 300, null, openFullNotification);
    });

    // 学校管理功能交互框
    activeModal(linkSchoolBtn, closeLinkcshoolBtn, linkschoolModal, 300, null, () => {
        document.getElementById('linkResult').textContent = '';
    });
    activeModal(quitSchoolBtn, closeQuitschoolBtn, quitschoolModal, 300);

    // 提交表单数据
    editSubmit(token, submitButtons);
});

window.submitLink = () => {
    let inviteCode = document.getElementById('inviteCode');
    if (!inviteCode.value) {
        document.getElementById('linkResult').textContent = "请输入邀请码";
        return;
    }
    fetch('/api/link_schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkType: "link", invite_code: inviteCode.value })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('linkResult').textContent = data.message;
            inviteCode.value = '';
        });
}

window.confirmQuit = () => {
    fetch('/api/link_schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkType: "quit" })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        });
}

async function fetchUserInfo(fields, schoolInfoFields, token) {
    try {
        const response = await fetch('/api/get_user_info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Error:', response.statusText + ' ' + data.message);
            window.parent.location.href = '/login'; // 重定向到登录页面
            return;
        }

        // 批量更新 DOM 元素
        // 需要后端返回的字段和此处fields数组内的字段一致
        if (data) {
            Object.keys(fields).forEach(field => {
                if (data.data[field] == undefined || data.data[field] == null) {
                    fields[field].textContent = '暂无信息';
                } else {
                    fields[field].textContent = data.data[field];
                }
            });
            if (data.schooldata) {
                Object.keys(schoolInfoFields).forEach(sfield => {
                    if (data.schooldata[sfield] == undefined || data.schooldata[sfield] == null) {
                        schoolInfoFields[sfield].textContent = '暂无信息';
                    } else {
                        schoolInfoFields[sfield].textContent = data.schooldata[sfield];
                    }
                });
            } else {
                schoolInfoFields.schoolName.textContent = '未关联学校';
            }
        } else {
            console.error('数据不匹配');
            resetFields();
        }
    } catch (error) {
        console.error('Error:', error);
        resetFields();
    }
}

function resetFields() {
    Object.values(fields).forEach(field => {
        field.textContent = '信息获取失败';
    });
}

function editSubmit(token, submitButtons) {
    submitButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const field = e.target.dataset.field;
            const input = document.getElementById(`edit-${field}`);
            const value = input.value.trim();

            if (value === '') {
                alert('请输入有效数据');
                return;
            }

            try {
                const response = await fetch('/api/set_user_info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ field, value, token }),
                });

                const result = await response.json();
                if (response.ok) {
                    alert('提交成功');
                    location.reload();
                } else {
                    alert('提交失败');
                    console.log('错误: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                alert('网络错误');
            }
        });
    });
}