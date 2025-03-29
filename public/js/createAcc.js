// 监听文件输入框的变化事件
document.getElementById('fileInput').addEventListener('change', handleFile, false);

// 点击上传按钮时触发文件选择
document.querySelector('.upload-button').addEventListener('click', function (e) {
    e.stopPropagation(); // 防止事件冒泡
    document.getElementById('fileInput').click();
});

function handleFile(event) {
    const file = event.target.files[0];
    const statusElement = document.getElementById('status');

    if (!file) {
        statusElement.textContent = '未选择文件';
        statusElement.className = 'status error';
        return;
    }

    // 显示正在处理的状态
    statusElement.textContent = '正在处理文件...';
    statusElement.className = 'status';

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // 获取第一个工作表
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 获取首行
            const headerRow = jsonData[0];

            // 定义需要提取的列
            const targetColumns = ['姓名', '性别'];

            // 找到目标列的索引
            const columnIndices = {};
            headerRow.forEach((header, index) => {
                if (targetColumns.includes(header)) {
                    columnIndices[header] = index;
                }
            });

            // 检查是否找到所有必需的列
            if (Object.keys(columnIndices).length !== targetColumns.length) {
                throw new Error('Excel文件缺少必要的列：' +
                    targetColumns.filter(col => !(col in columnIndices)).join(', '));
            }

            // 提取目标列的数据
            const extractedData = jsonData.slice(1).map(row => {
                const result = {};
                for (const [header, index] of Object.entries(columnIndices)) {
                    result[header] = row[index];
                }
                return result;
            });

            // 将数据发送到后端
            sendDataToBackend(extractedData);
        } catch (error) {
            statusElement.textContent = '处理文件失败：' + error.message;
            statusElement.className = 'status error';
            console.error('Error processing file:', error);
        }
    };

    reader.onerror = function () {
        statusElement.textContent = '读取文件失败！';
        statusElement.className = 'status error';
    };

    reader.readAsArrayBuffer(file);
}

// 发送数据到后端
function sendDataToBackend(data) {
    const statusElement = document.getElementById('status');

    fetch('/api/create_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('上传错误：' + response.message);
            }
            return response.json();
        })
        .then(result => {
            statusElement.textContent = '数据上传成功！';
            statusElement.className = 'status success';

            document.getElementById('studentCount').textContent = 12;
            document.getElementById('maleCount').textContent = 8;
            document.getElementById('femaleCount').textContent = 4;


            console.log('Success:', result);
        })
        .catch(error => {
            statusElement.textContent = '数据上传失败：' + error.message;
            statusElement.className = 'status error';
            console.error('Error:', error);
        });
}