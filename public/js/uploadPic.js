// 获取上传表单和文件输入
const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const resultDisplay = document.getElementById('result');
const uploadCountDisplay = document.getElementById('uploadCount');
const progressBar = document.getElementById('progressBar');

// const maxUploads = 3;

// 更新上传计数显示
async function updateUploadCountDisplay() {
    try {
        const response = await fetch('/api/get_upload_img_list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error('网络响应异常');
        }
        const data = await response.json(); // 解析返回的 JSON 数据
        uploadCountDisplay.textContent = data.data.count;
    } catch (err) {
        console.error('获取学生信息失败:', error);
    }
}
// function updateUploadCountDisplay() {
//     uploadCountDisplay.textContent = uploadCount;
//     const progressPercentage = (uploadCount / maxUploads) * 100;
//     progressBar.style.width = `${progressPercentage}%`;
    
//     if (uploadCount >= maxUploads) {
//         // 禁用文件输入和提交按钮
//         document.getElementById('fileInput').disabled = true;
//         document.querySelector('#uploadForm button[type="submit"]').disabled = true;
//         uploadCountDisplay.style.color = '#ff5722';
//     }
// }

form.addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单默认提交行为

    const formData = new FormData();

    // 将文件添加到 FormData 中，字段名为 'images'
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    formData.append('uploadType', 'sp_img');
    const token = localStorage.getItem('token');
    
    // 显示上传中状态
    resultDisplay.textContent = '上传中...';
    resultDisplay.style.borderLeft = '4px solid #FFC107';
    resultDisplay.style.backgroundColor = '#FFF8E1';
    
    fetch('/api/upload_images', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                resultDisplay.textContent = `成功: ${data.message}`;
                resultDisplay.style.borderLeft = '4px solid #4CAF50';
                resultDisplay.style.backgroundColor = '#E8F5E9';
                updateUploadCountDisplay();
            } else {
                resultDisplay.textContent = `错误: ${data.message}`;
                resultDisplay.style.borderLeft = '4px solid #F44336';
                resultDisplay.style.backgroundColor = '#FFEBEE';
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
            resultDisplay.textContent = '上传失败，请重试！';
            resultDisplay.style.borderLeft = '4px solid #F44336';
            resultDisplay.style.backgroundColor = '#FFEBEE';
        });
});

// 初始化显示
updateUploadCountDisplay();