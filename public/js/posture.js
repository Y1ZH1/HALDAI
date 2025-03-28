// 获取数据
async function fetchUserData() {
    try {
        const response = await fetch('/api/get_posture_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('网络响应异常');
        }
        const data = await response.json(); // 解析返回的 JSON 数据

        // 获取图片
        const res_img = await fetch('/api/get_upload_img_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const img = await res_img.json();
        let img_names;
        if (img.code != 0) {
            img_names = img.data.filenames;
            for (let i = 0; i < img.data.count; i++) {
                img_names[i] = '../uploads/' + img.data.user_folder + '/images/' + img_names[i];
            }
        } else {
            img_names = null;
        }

        // 返回学生信息
        return {
            name: data.data.userName || "暂无信息",
            gender: data.data.userGender || "暂无信息",
            school: data.data.userSchool || "暂无信息",
            studentId: data.data.userStid || "暂无信息",
            class: data.data.userClass || "暂无信息",
            department: data.data.userDepartment || "暂无信息",
            postureAnalysis: data.data.userBody || "暂无信息",
            images: img_names
        };
    } catch (error) {
        console.error('获取学生信息失败:', error);
        return null;
    }
}

// 渲染用户信息
function renderUserInfo(userData) {
    const userInfoContent = document.getElementById('user-info-content');
    userInfoContent.innerHTML = `
        <div class="info-item">
            <div class="info-label">姓名：</div>
            <div class="info-value">${userData.name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">学校：</div>
            <div class="info-value">${userData.school}</div>
        </div>
        <div class="info-item">
            <div class="info-label">学号：</div>
            <div class="info-value">${userData.studentId}</div>
        </div>
        <div class="info-item">
            <div class="info-label">班级：</div>
            <div class="info-value">${userData.class}</div>
        </div>
        <div class="info-item">
            <div class="info-label">性别：</div>
            <div class="info-value">${userData.gender}</div>
        </div>
    `;
}

// 渲染体态分析
function renderPostureAnalysis(analysisText) {
    const analysisContent = document.getElementById('analysis-content');
    analysisContent.innerHTML = analysisText;
}

// 渲染图片
function renderImages(images) {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = '';

    images.forEach(imageUrl => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = '体态分析图片';
        img.onerror = function () {
            this.src = 'https://iph.href.lu/200x200?text=图片加载失败';
        };

        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);
    });
}

// 初始化页面
async function initPage() {
    try {
        const userData = await fetchUserData();
        renderUserInfo(userData);
        renderPostureAnalysis(userData.postureAnalysis);
        renderImages(userData.images);
    } catch (error) {
        console.error('获取数据失败:', error);
        document.querySelectorAll('.loading').forEach(el => {
            el.textContent = '加载失败，请刷新页面重试';
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initPage);