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
});
