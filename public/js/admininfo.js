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
        userID: document.getElementById('ID'),
        userSchool: document.getElementById('school'),
        userTel: document.getElementById('tel'),
        userEmail: document.getElementById('email')
    };

    fetchUserInfo(fields, token);

    const editBtn = document.querySelectorAll('.action-button')[0]; // 编辑信息按钮
    const schoolBtn = document.querySelectorAll('.action-button')[1]; // 学校管理按钮
    const notificationBtn = document.querySelectorAll('.action-button')[2]; // 通知提醒按钮

    const editModal = document.getElementById('edit-modal');
    const closeEditModalBtn = document.getElementById('close-modal');
    const submitButtons = document.querySelectorAll('.submit-btn');

    // 开关编辑信息交互框
    activeModal(editBtn, closeEditModalBtn, editModal, 300);
    // 提交表单数据
    editSubmit(token, submitButtons);
});

async function fetchUserInfo(fields, token) {
    try {
        const response = await fetch('/api/get_manager_info', {
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
                if (data.data[field] == undefined || data.data[field] == null) {
                    fields[field].textContent = '暂无信息';
                } else {
                    fields[field].textContent = data.data[field];
                }
            });
            // 把用户基础信息存到本地
            localStorage.setItem('name', data.data.userName);
        } else {
            console.error('数据不匹配');
            resetFields();
        }
    } catch (error) {
        console.error('Error:', error);
        resetFields();
    }
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
                const response = await fetch('/api/set_manager_info', {
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
                    alert('提交失败: ' + result.message);
                    console.log('错误: ' + result.message);
                }
            } catch (error) {
                console.error(error);
                alert('网络错误');
            }
        });
    });
}