//Scripts.js
document.getElementById('registerForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://192.168.0.107:80/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('注册成功');
      window.location.href = 'login.html';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('注册失败', error);
  }
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('登录成功');
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html'; // 跳转到用户主页
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error('登录失败', error);
  }
});
