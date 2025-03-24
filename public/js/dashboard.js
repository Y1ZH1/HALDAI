import { activeModal } from '../js/modal.js'

document.addEventListener('DOMContentLoaded', async () => {
    //未登录时退出
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

        const result = await response.json();
        if (!response.ok) {
            localStorage.removeItem('token');
            console.log('INFO: ' + result.massage)
            alert('登录过期，请重新登陆！');
            window.location.href = '/login';
        } else if ('/' + result.type != window.location.pathname) {
            window.location.href = '/login';
        }
    } catch (error) {
        localStorage.removeItem('token');
        console.error('ERROR: ' + error.message);
        alert('身份验证出错，请重新登陆');
        window.location.href = '/login';
    }

    logoutBtn();
});

// 切换侧边栏展开和收回
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.getElementById('main-content');

    if (sidebar.style.left === '0px') {
        sidebar.style.left = '-250px';  // 隐藏侧边栏
        mainContent.style.marginLeft = '0';  // 主内容宽度恢复
    } else {
        sidebar.style.left = '0';  // 展开侧边栏
        mainContent.style.marginLeft = '250px';  // 主内容左侧偏移
    }
}

// 监听点击左上角菜单按钮，切换侧边栏的显示与隐藏
document.querySelector('.menu-title').addEventListener('click', toggleSidebar);

// 跳转页面
window.redirectPage = function (url) {
    window.location.href = url;
}

// 加载外部网页到iframe
window.loadPage = function (url) {
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
function logoutBtn() {
    const logoutBtn = document.getElementById('logout-btn'); // 退出登录按钮
    const logoutModal = document.getElementById('logout-modal');
    const closeLogoutModalBtn = document.getElementById('cancel-logout'); // 取消按钮
    const confirmLogoutBtn = document.getElementById('confirm-logout'); // 确认按钮

    // 开关退出登录交互框
    activeModal(logoutBtn, closeLogoutModalBtn, logoutModal, 0, 180);

    // 确认退出登录
    confirmLogoutBtn.addEventListener('click', async () => {
        // 处理退出登录逻辑
        localStorage.removeItem('token'); // 移除 token
        try {
            await fetch('/api/log_out', { method: 'POST' });
        } catch (error) {
            console.error('ERR: ' + '清除 session 错误：' + error.massage);
        }
        window.location.href = '/login'; // 跳转到登录页面
    });
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