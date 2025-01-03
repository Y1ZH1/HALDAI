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
    // 获取用户信息
    fetchUserInfo(fields, token);

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

    // 开关编辑信息交互框
    activeModal(editBtn, closeEditModalBtn, editModal, null, null, 300);
    // 开关学校管理交互框
    activeModal(schoolBtn, closeSchoolModalBtn, schoolModal, null, null, 300);
    // 开关通知提醒交互框
    activeModal(notificationBtn, closeNotificationModalBtn, notificationModal, null, null, 300);

    // 开关完整通知内容交互框
    viewFullBtns.forEach((btn, index) => {
        const openFullNotification = () => {
            const title = notificationPreviews[index].querySelector('strong').textContent;
            const content = notificationPreviews[index].querySelector('p').textContent;
            // 设置完整通知的标题和内容
            document.getElementById('notification-title').textContent = title;
            document.getElementById('notification-content').textContent = content;
        };
        activeModal(btn, closeFullNotificationModalBtn, fullNotificationModal, openFullNotification, null, 300);
    });

    // 提交表单数据
    editSubmit(token, submitButtons);
});

async function fetchUserInfo(fields, token) {
    try {
        const response = await fetch('/api/get_user_info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        
        const data = await response.json();
        if (!response.ok) {
            console.error('Error:', response.statusText + ' ' + data.message);
            localStorage.removeItem('token');
            window.parent.location.href = '/login'; // 重定向到登录页面
            return;
        }

        // 批量更新 DOM 元素
        // 需要后端返回的字段和此处fields数组内的字段一致
        if (data) {
            Object.keys(fields).forEach(field => {
                if (data.data[field] !== undefined) {
                    fields[field].textContent = data.data[field];
                }
            });
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