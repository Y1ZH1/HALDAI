document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  
  // 注册表单提交事件
  if (registerForm) {
      registerForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          
          const username = registerForm.username.value;
          const password = registerForm.password.value;
          
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
                  // 可以将 token 保存到 localStorage 或 cookies 中
                  localStorage.setItem('token', result.token);
                  loginForm.reset();  // 清空表单
                  window.location.href = '/dashboard'; // 登录成功后的跳转页面
              } else {
                  alert(result.message);  // 用户不存在或密码错误
              }
          } catch (error) {
              alert('服务器错误，请稍后重试');
              console.error(error);
          }
      });
  }
});
