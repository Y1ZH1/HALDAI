document.addEventListener('DOMContentLoaded', () => {
    const fields = {
        userName: document.getElementById('username'),
        userID: document.getElementById('id'),
        userGender: document.getElementById('gender'),
        userSchool: document.getElementById('school'),
        userAge: document.getElementById('age'),
        userTel: document.getElementById('tel'),
        userSchoolid: document.getElementById('sch-id')
    };
    const token = localStorage.getItem('token'); // 从 localStorage 获取 token

    // 如果没有 token，直接返回
    if (!token) {
        console.error('未找到token');
        window.parent.location.href = '/login';
        return;
    }

    async function fetchUserInfo() {
        try {
            const response = await fetch('/api/get_user_info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error('Error:', response.statusText);
                if (response.status === 401) {
                    console.error('Token 无效或过期');
                    localStorage.removeItem('token');
                    window.parent.location.href = '/login'; // 重定向到登录页面
                    return;
                }
            }

            const data = await response.json();

            // 批量更新 DOM 元素
            // 需要后端返回的字段和此处fields数组内的字段一致
            if (data) {
                Object.keys(fields).forEach(field => {
                    if (data[field] !== undefined) {
                        fields[field].textContent = data[field];
                    }
                });
            } else {
                console.error('不匹配数据:', data);
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

    fetchUserInfo();

    const editBtn = document.getElementById('edit-info-btn');
    const modal = document.getElementById('edit-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const submitButtons = document.querySelectorAll('.submit-btn');

    // 打开交互框
    editBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // 关闭交互框
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // 提交表单数据
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
});
