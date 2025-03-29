window.onload = () => {
    localStorage.removeItem('current_stu');
};
document.getElementById('studentForm').addEventListener('submit', function (event) {
    event.preventDefault(); // 阻止表单的默认提交行为

    // 显示加载状态
    document.querySelectorAll('.loading').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.empty-state').forEach(el => el.style.display = 'none');

    // 获取表单数据
    const className = document.getElementById('class').value;
    const studentName = document.getElementById('name').value;

    // 构建请求数据
    const requestData = {
        className: className,
        name: studentName
    };

    // 显示状态消息
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = '正在查询...';
    statusMessage.className = 'status-message';
    statusMessage.style.display = 'block';

    fetch('/api/get_stu_posture_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            // 隐藏加载状态
            document.querySelectorAll('.loading').forEach(el => el.style.display = 'none');

            // 更新状态消息
            statusMessage.textContent = '查询成功！';
            statusMessage.className = 'status-message success';

            // 更新学生信息
            const studentInfoContent = document.getElementById('student-info-content');
            studentInfoContent.innerHTML = `
            <div class="info-item">
                <div class="info-label">姓名：</div>
                <div class="info-value">${data.data.userName || '-'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">学号：</div>
                <div class="info-value">${data.data.userStid || '-'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">性别：</div>
                <div class="info-value">${data.data.userGender || '-'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">班级：</div>
                <div class="info-value">${data.data.userClass || '-'}</div>
            </div>
        `;

            // 更新体态信息
            const postureContent = document.getElementById('posture-content');
            postureContent.textContent = data.data.userBody || '暂无体态信息';

            // 更新图片区域
            localStorage.setItem('current_stu', data.data.userUuid);
            renderExampleImages(data.data.userImg);
        })
        .catch(error => {
            console.error('Error:', error);

            // 隐藏加载状态
            document.querySelectorAll('.loading').forEach(el => el.style.display = 'none');

            // 显示错误消息
            statusMessage.textContent = '查询失败，请重试！';
            statusMessage.className = 'status-message error';

            // 恢复空状态显示
            document.querySelectorAll('.empty-state').forEach(el => el.style.display = 'block');
        });
});

// 渲染图片
async function renderExampleImages(imgdata) {
    const galleryContainer = document.getElementById('gallery-container');
    if (!imgdata) {
        return;
    }
    let postureleImages = imgdata.filenames;

    for (let i = 0; i < imgdata.count; i++) {
        postureleImages[i] = '../uploads/' + imgdata.user_folder + '/images/' + postureleImages[i];
    }
    galleryContainer.innerHTML = '';
    postureleImages.forEach(image => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = image;
        // img.alt = image.caption;
        img.onerror = function () {
            this.src = 'https://iph.href.lu/180x180?text=图片加载失败';
        };

        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = image.caption;

        galleryItem.appendChild(img);
        galleryItem.appendChild(caption);
        galleryContainer.appendChild(galleryItem);
    });
}

// 文件上传功能
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadResult = document.getElementById('upload-result');

// 显示选择的文件
fileInput.addEventListener('change', function () {
    fileList.innerHTML = '';

    if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;

            fileItem.appendChild(fileName);
            fileList.appendChild(fileItem);
        }
    }
});

// 处理文件上传
uploadForm.addEventListener('submit', function (event) {
    let stuuuid = localStorage.getItem('current_stu');
    event.preventDefault();

    if (fileInput.files.length === 0) {
        uploadResult.textContent = '请选择要上传的文件！';
        uploadResult.className = 'upload-result error';
        uploadResult.style.display = 'block';
        return;
    }

    const formData = new FormData();

    // 将文件添加到 FormData 中
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    formData.append('uploadType', 'sp_img');
    const token = localStorage.getItem('token');

    // 显示上传中状态
    uploadResult.textContent = '正在上传...';
    uploadResult.className = 'upload-result';
    uploadResult.style.display = 'block';
    console.log('111');

    fetch('/api/upload_stu_images', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'uuid': stuuuid,
        },
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                uploadResult.textContent = `成功: ${data.message}`;
                uploadResult.className = 'upload-result success';

                // 清空文件选择
                fileInput.value = '';
                fileList.innerHTML = '';

            } else {
                uploadResult.textContent = `错误: ${data.message}`;
                uploadResult.className = 'upload-result error';
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
            uploadResult.textContent = '上传失败，请重试！';
            uploadResult.className = 'upload-result error';
        });
});