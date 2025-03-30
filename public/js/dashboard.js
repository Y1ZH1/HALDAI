import { activeModal } from "../js/modal.js"

document.addEventListener("DOMContentLoaded", async () => {
    // 未登录时退出
    const token = localStorage.getItem("token")
    if (!token) {
        console.error("未找到token")
        window.location.href = "/login"
        return
    }
    try {
        const response = await fetch("/api/varify_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
        })

        const result = await response.json()
        if (!response.ok) {
            localStorage.removeItem("token")
            console.log("INFO: " + result.massage)
            alert("登录过期，请重新登陆！")
            window.location.href = "/login"
        } else if ("/" + result.type != window.location.pathname) {
            window.location.href = "/login"
        }
        updateUserInfo(result);
    } catch (error) {
        localStorage.removeItem("token")
        console.error("ERROR: " + error.message)
        alert("身份验证出错，请重新登陆")
        window.location.href = "/login"
    }

    logoutBtn()
    setupSidebarEvents()
})

// 更新用户信息
function updateUserInfo(user) {
    if (user) {
        // 如果有用户数据，更新侧边栏的用户信息
        const userNameElement = document.querySelector(".user-name")
        const userAvatarElement = document.querySelector(".user-avatar img")
        if (userNameElement && user.username) {
            userNameElement.textContent = user.username;
        }

        if (userAvatarElement && user.avatar) {
            userAvatarElement.src = user.avatar
        }
    }
}

// 切换侧边栏展开和收回
function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar")
    const mainContent = document.getElementById("main-content")

    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px" // 隐藏侧边栏
        mainContent.style.marginLeft = "0" // 主内容宽度恢复
    } else {
        sidebar.style.left = "0" // 展开侧边栏
        mainContent.style.marginLeft = "250px" // 主内容左侧偏移
    }
    // 更新页面标题和面包屑
    updatePageTitle()
}

// 设置侧边栏事件
function setupSidebarEvents() {
    const sidebarItems = document.querySelectorAll(".sidebar-item")

    sidebarItems.forEach((item) => {
        // 鼠标悬停效果
        item.addEventListener("mouseenter", function () {
            if (!this.classList.contains("active")) {
                this.style.backgroundColor = "rgba(67, 97, 238, 0.1)"
            }
        })

        item.addEventListener("mouseleave", function () {
            if (!this.classList.contains("active")) {
                this.style.backgroundColor = ""
            }
        })

        // 点击激活效果
        item.addEventListener("click", function () {
            sidebarItems.forEach((i) => {
                i.classList.remove("active");
                i.style.backgroundColor = "";
            })
            this.classList.add("active")
        })
    })
}

// 更新页面标题和面包屑
function updatePageTitle() {
    const activeItem = document.querySelector(".sidebar-item.active")
    if (activeItem) {
        const pageTitle = activeItem.querySelector("span").textContent
        document.getElementById("page-title").textContent = pageTitle
        document.getElementById("breadcrumb-current").textContent = pageTitle
    }
}

// 跳转页面
window.redirectPage = (url) => {
    window.location.href = url
}

// 加载外部网页到iframe
window.loadPage = (url) => {
    const iframe = document.getElementById("content-frame")

    // 确保 iframe 元素存在
    if (iframe) {
        iframe.style.display = "block"
        iframe.src = url
    }

    // 更新侧边栏选中的项
    const sidebarItems = document.querySelectorAll(".sidebar-item")
    sidebarItems.forEach((item) => item.classList.remove("active"))

    // 确保选中项存在
    const selectedItem = document.querySelector(`.sidebar-item[onclick*="${url}"]`)
    if (selectedItem) {
        selectedItem.classList.add("active")

        // 更新页面标题和面包屑
        const pageTitle = selectedItem.querySelector("span").textContent
        document.getElementById("page-title").textContent = pageTitle
        document.getElementById("breadcrumb-current").textContent = pageTitle
    }
}

// 页面加载时确保默认选中第一个菜单项并加载相应内容
window.onload = () => {
    const firstItem = document.getElementById("UserInfo") // 获取 UserInfo页
    if (firstItem) {
        // 获取 UserInfo 的 onclick 属性，并加载页面
        const onclickAttr = firstItem.getAttribute("onclick")
        const url = onclickAttr.match(/'([^']+)'/)[1]
        loadPage(url)
    }
}

// 退出登录逻辑
function logoutBtn() {
    const logoutBtn = document.getElementById("logout-btn") // 退出登录按钮
    const logoutModal = document.getElementById("logout-modal")
    const closeLogoutModalBtn = document.getElementById("cancel-logout") // 取消按钮
    const confirmLogoutBtn = document.getElementById("confirm-logout") // 确认按钮
    const closeModalX = document.getElementById("close-modal") // X按钮

    // 开关退出登录交互框
    activeModal(logoutBtn, closeLogoutModalBtn, logoutModal, 0, 200)

    // 确认退出登录
    confirmLogoutBtn.addEventListener("click", async () => {
        // 处理退出登录逻辑
        localStorage.removeItem("token") // 移除 token
        try {
            await fetch("/api/log_out", { method: "POST" })
        } catch (error) {
            console.error("ERR: " + "清除 session 错误：" + error.message)
        }
        window.location.href = "/login" // 跳转到登录页面
    })
}

// 获取夜间模式切换按钮和当前主题
const themeToggleButton = document.getElementById("theme-toggle")
const body = document.body
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg><span>夜间模式</span>`
const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg><span>日间模式</span>`

// 检查本地存储中是否已有主题设置
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark")
    themeToggleButton.innerHTML = sunIcon
}

// 切换日夜模式
themeToggleButton.addEventListener("click", () => {
    body.classList.toggle("dark")

    // 切换符号
    if (body.classList.contains("dark")) {
        themeToggleButton.innerHTML = sunIcon
        localStorage.setItem("theme", "dark") // 保存到本地存储
    } else {
        themeToggleButton.innerHTML = moonIcon
        localStorage.removeItem("theme") // 清除本地存储
    }
})

