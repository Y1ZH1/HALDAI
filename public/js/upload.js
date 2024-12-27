// 获取上传表单和文件输入
const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const resultDisplay = document.getElementById('result');

let uploadCount = 0;
const maxUploads = 3;

form.addEventListener('submit', function (event) {
    event.preventDefault();  // 阻止表单默认提交行为

    const formData = new FormData();

    // 将文件添加到 FormData 中，字段名为 'images'
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
    }

    formData.append('uploadType', 'sp_img');
    const token = localStorage.getItem('token');

    if (uploadCount >= maxUploads) {
        // 禁用文件输入和提交按钮
        document.getElementById('fileInput').disabled = true;
        document.querySelector('#uploadForm button[type="submit"]').disabled = true;
        alert('上传次数已达三次！');
      }
      
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
                uploadCount += 1;
            } else {
                resultDisplay.textContent = `错误: ${data.message}`;
            }
        })
        .catch(error => {
            console.error('上传失败:', error);
            resultDisplay.textContent = '上传失败，请重试！';
        });
});