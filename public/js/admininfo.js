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
        } else {
            console.error('数据不匹配');
            resetFields();
        }
    } catch (error) {
        console.error('Error:', error);
        resetFields();
    }
}