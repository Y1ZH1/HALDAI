document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const message = document.getElementById('message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            message.textContent = '请选择一个文件';
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                message.textContent = '图片上传成功';
                fileInput.value = ''; // 清空文件输入
            } else {
                message.textContent = '图片上传失败: ' + data.message;
            }
        })
        .catch(error => {
            console.error('上传错误:', error);
            message.textContent = '上传过程中发生错误';
        });
    });
});