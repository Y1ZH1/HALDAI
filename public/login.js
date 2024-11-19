document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // 注册表单提交事件
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();  // 阻止默认表单提交
            
            const username = registerForm.username.value;
            const password = registerForm.password.value;

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
                    body: JSON.stringify({ username, password })
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
                    localStorage.setItem('token', result.token);
                    loginForm.reset();  // 清空表单
                    // 登录成功后直接跳转到 dashboard 页面
                    window.location.href = '/dashboard';
                } else {
                    alert(result.message);  // 用户名或密码错误
                    registerForm.reset();
                }
            } catch (error) {
                alert('服务器错误，请稍后重试');
                console.error(error);
            }
        });
    }

    // 检查用户是否已登录，若没有 token 或 token 无效，重定向到登录页面
    if (window.location.pathname === '/dashboard') {
        console.log('进入dashboard');   //DEBUG
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('没有Token');
            // 没有 token，重定向到登录页面
            window.location.href = '/login';
        } else {
            console.log('Token from localStorage:', token);  //DEBUG

            // 如果有 token，验证 token 是否有效
            fetch('/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`  // 添加 Authorization 头部发送 token
                }
            })
            .then(response => {
                if (!response.ok) {
                    // 如果 token 无效，重定向到登录页面
                    window.location.href = '/login';
                }
            })
            .catch(error => {
                console.error('验证 token 时出错:', error);
                window.location.href = '/login';
            });
        }
    }
});
