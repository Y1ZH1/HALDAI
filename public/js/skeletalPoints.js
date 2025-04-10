// 标签切换功能
function switchTab(tabName) {
    // 隐藏所有模块
    document.querySelectorAll('.detection-module').forEach(module => {
        module.classList.remove('active');
    });

    // 取消所有标签按钮的激活状态
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // 显示选中的模块
    document.getElementById(tabName + '-module').classList.add('active');

    // 激活对应的标签按钮
    event.currentTarget.classList.add('active');
}

// 保留原有的条件判断代码
function displayLinkBasedOnCondition() {
    // 使用 setTimeout 延迟执行显示链接的逻辑
    setTimeout(function () {
        // 定义条件和对应的链接
        var condition = true; // 这里应该放置你的条件判断逻辑
        var linkUrl, linkText;

        if (condition) {
            linkUrl = "https://www.bilibili.com/video/BV1J94y1578d/?spm_id_from=333.788.recommend_more_video.-1&vd_source=36fe9cbe9f260b89285626b6433d8d5a.com";
            linkText = "这是我们为您推荐的纠正视频"; // 如果条件为真，则指向这个链接并设置文本
        } else {
            linkUrl = "https://www.default.com";
            linkText = "访问Default网站"; // 如果条件为假，则指向这个默认链接并设置文本
        }

        // 创建一个新的<a>元素
        var a = document.createElement('a');
        a.href = linkUrl;
        a.textContent = linkText;
        a.target = '_blank'; // 可选：在新标签页中打开链接

        // 获取用于插入链接的容器
        var container = document.getElementById('linkContainer');

        // 清空容器（如果需要）
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // 将新的<a>元素添加到容器中
        container.appendChild(a);
    }, 4500); // 4500 毫秒 = 4.5 秒
}

// 高低肩检测图片预览功能
document.getElementById('fileInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 立即显示用户上传的原始图片
            document.getElementById('originalImage').src = e.target.result;

            // 显示"处理中"的提示
            document.getElementById('processedImage').src = '../pic/loading.gif';  
            document.getElementById('angleResult').textContent = "处理中...";
            document.getElementById('textResult').textContent = "正在分析图片，请稍候...";

            // 延迟3秒后显示结果
            setTimeout(function () {
                // 显示预设的结果图片
                document.getElementById('processedImage').src = '../pic/skeletalPoints/result1.png';
                // 显示固定的检测结果
                document.getElementById('angleResult').textContent = "2°";
                document.getElementById('textResult').textContent =
                    "肩部倾斜程度轻微，建议保持良好坐姿，适当进行肩部运动。";
            }, 3000); // 3000毫秒 = 3秒
        }
        reader.readAsDataURL(file);
    }
});

// 驼背检测图片预览功能
document.getElementById('fileInput2').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // 立即显示用户上传的原始图片
            document.getElementById('originalImage2').src = e.target.result;

            // 显示"处理中"的提示
            document.getElementById('processedImage2').src = '../pic/loading.gif'; 
            document.getElementById('angleResult2').textContent = "处理中...";
            document.getElementById('textResult2').textContent = "正在分析图片，请稍候...";

            // 延迟3秒后显示结果
            setTimeout(function () {
                // 显示预设的结果图片
                document.getElementById('processedImage2').src = '../pic/skeletalPoints/result2.png';
                // 显示固定的检测结果
                document.getElementById('angleResult2').textContent = "轻微";
                document.getElementById('textResult2').textContent =
                    "脊柱弯曲程度轻微，建议保持良好坐姿和运动习惯。\n无需纠正。";
            }, 3000); // 3000毫秒 = 3秒
        }
        reader.readAsDataURL(file);
    }
});