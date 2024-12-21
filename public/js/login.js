document.addEventListener('DOMContentLoaded', () => {
    checkLogin();
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // 注册表单提交事件
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();  // 阻止默认表单提交

            const name = registerForm.name.value;
            const username = registerForm.username.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            const gender = registerForm.gender.value;
            const phone = registerForm.phone.value;
            const birthdate = registerForm.birthdate.value;


            if (!registerForm.checkValidity()) {
                alert("请确保密码和确认密码一致！");
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, username, password, confirmPassword, gender, phone, birthdate })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);  // 用户注册成功
                    registerForm.reset();    // 清空表单
                    window.location.href = '/login'; // 跳转到登录页面
                } else {
                    alert(result.message);  // 用户名已存在或其他错误
                    registerForm.reset();
                }
            } catch (error) {
                alert('服务器错误，请稍后重试');
                console.error(error);
            }
        });
    }

    // 登录表单提交事件
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();
                if (response.ok) {
                    alert('登录成功');
                    // 将 token 保存到 localStorage 中
                    localStorage.setItem('token', result.data.token);
                    loginForm.reset();  // 清空表单
                    // 登录成功后直接跳转到 dashboard 页面
                    if (result.type === 'user') {
                        window.location.href = '/user';
                    } else if (result.type === 'manager') {
                        window.location.href = '/manager';
                    } else {
                        alert('此类用户暂无法登录');
                    }
                } else {
                    alert(result.message);  // 用户名或密码错误
                    loginForm.reset();
                }
            } catch (error) {
                alert('服务器错误，请稍后重试');
                console.error(error);
            }
        });
    }

    
});

async function checkLogin() {
    // 检查用户是否已登录，若有 token，重定向到dashboard页面
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/varify_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        const result = await response.json();
        if (response.ok) {
            console.log('INFO: 已登录，跳转至主页');
            if (result.type == 'user') {
                window.location.href = '/user';
            } else if (result.type == 'manager') {
                window.location.href = '/manager';
            } else {
                return;
            }
        }
    } catch (error) {
        localStorage.removeItem('token');
        console.log('INFO: 已移除过期 Token');
    }
}