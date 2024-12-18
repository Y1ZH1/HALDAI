//未登录时退出
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
        console.error('未找到token');
        window.location.href = '/login';
        return;
    }
    try {
        const response = await fetch('/api/varify_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
        console.log('token: ' + token);

        if (!response.ok) {
            localStorage.removeItem('token');
            alert('登录过期，请重新登陆！');
            window.location.href = '/login';
        }
    } catch (error) {
        localStorage.removeItem('token');
        alert('身份验证出错，请重新登陆');
        window.location.href = '/login';
    }
});

// 获取元素
const menuButton = document.getElementById('menu-button');
const logoutMenu = document.getElementById('logout-menu');

// 加载外部网页到iframe
function loadPage(url) {
    const iframe = document.getElementById('content-frame');
    const defaultContent = document.getElementById('default-content');

    // 确保 iframe 元素存在
    if (iframe) {
        iframe.style.display = 'block';
        iframe.src = url;
    }

    // 更新侧边栏选中的项
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));

    // 确保选中项存在
    const selectedItem = document.querySelector(`.sidebar-item[href*="${url}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
}

// 页面加载时确保默认选中第一个菜单项并加载相应内容
window.onload = function () {
    const firstItem = document.getElementById('UserInfo'); // 获取 UserInfo页
    if (firstItem) {
        // 获取 UserInfo 的 href 属性，并加载页面
        loadPage(firstItem.getAttribute('onclick').match(/'([^']+)'/)[1]);
    }
};

// 退出登录逻辑
function logout() {
    var isConfirmed = confirm("确定要退出登录吗？");

    if (isConfirmed) {
        // TODO: 需要删除token的逻辑
        localStorage.removeItem('token');  // 删除 token
        window.location.href = '/login';
    } else {
        console.log("用户取消退出登录");
    }
}

// 侧边栏鼠标悬停效果
const sidebarItems = document.querySelectorAll('.sidebar-item');
sidebarItems.forEach(item => {
    item.addEventListener('mouseenter', function () {
        item.style.backgroundColor = '#007bff';
    });
    item.addEventListener('mouseleave', function () {
        if (!item.classList.contains('active')) {
            item.style.backgroundColor = '';
        }
    });
});

// 获取夜间模式切换按钮和当前主题
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

// 检查本地存储中是否已有主题设置
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggleButton.innerHTML = '&#x263E;'; // 设置为月亮符号
}

// 切换日夜模式
themeToggleButton.addEventListener('click', function () {
    body.classList.toggle('dark-mode');

    // 切换符号
    if (body.classList.contains('dark-mode')) {
        themeToggleButton.innerHTML = '&#x263E;'; // 月亮符号
        localStorage.setItem('theme', 'dark'); // 保存到本地存储
    } else {
        themeToggleButton.innerHTML = '&#x2600;'; // 太阳符号
        localStorage.removeItem('theme'); // 清除本地存储
    }
});
