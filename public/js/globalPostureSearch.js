document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const searchModeSelect = document.getElementById('search-mode-select');
    const classField = document.getElementById('class-field');
    const postureField = document.getElementById('posture-field');
    const classInput = document.getElementById('class');
    const postureIssueInput = document.getElementById('posture-issue');
    const studentForm = document.getElementById('studentForm');
    const resultsList = document.getElementById('results-list');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    // Initialize UI based on default search mode
    updateSearchFields();

    // Event Listeners
    searchModeSelect.addEventListener('change', updateSearchFields);

    // Function to update search fields based on selected search mode
    function updateSearchFields() {
        const searchMode = searchModeSelect.value;

        // Reset fields
        classField.classList.remove('hidden');
        postureField.classList.remove('hidden');
        classInput.required = true;
        postureIssueInput.required = false;

        // Configure fields based on search mode
        switch (searchMode) {
            case 'class':
                postureField.classList.add('hidden');
                postureIssueInput.value = '';
                break;
            case 'posture':
                classField.classList.add('hidden');
                classInput.value = '';
                classInput.required = false;
                postureIssueInput.required = true;
                break;
            case 'class-posture':
                classInput.required = true;
                postureIssueInput.required = true;
                break;
        }
    }

    // Form submission handler
    studentForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const searchMode = searchModeSelect.value;
        let classValue = classInput.value.trim();
        let postureIssueValue = postureIssueInput.value.trim();
        let searchAllValue = false;

        // Configure request data based on search mode
        if (searchMode === 'posture') {
            classValue = '';
            searchAllValue = true;
        }

        // Construct request data
        const requestData = {
            className: classValue,
            postureIssue: postureIssueValue || null,
            searchAll: searchAllValue
        };

        // Show loading state
        resultsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-spinner fa-spin"></i>
                <p>正在查询...</p>
                <span>请稍候</span>
            </div>
        `;

        // Send request to backend
        fetch('/api/get_global_posture_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('没有查询到符合条件的学生');
                }
                return response.json();
            })
            .then(data => {
                // Update results count
                const count = data.data.length;
                resultsCount.textContent = `${count} 位学生`;

                // Clear previous results
                resultsList.innerHTML = '';

                // Check if there are results
                if (count === 0) {
                    resultsList.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>未找到符合条件的学生</p>
                        <span>请尝试修改搜索条件</span>
                    </div>
                `;
                    return;
                }

                // Display results
                data.data.forEach((student, index) => {
                    const resultItem = document.createElement('li');
                    resultItem.className = 'result-item fade-in';
                    resultItem.style.animationDelay = `${index * 0.1}s`;

                    resultItem.innerHTML = `
                    <div class="result-item-header">
                        <span class="student-name">${student.name}</span>
                        <span class="student-id">${student.student_id}</span>
                    </div>
                    <div class="result-item-details">
                        <div class="detail-group">
                            <div class="detail-label">班级</div>
                            <div class="detail-value">${student.class}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">院系</div>
                            <div class="detail-value">${student.department}</div>
                        </div>
                    </div>
                    <div class="body-info">
                        <div class="body-info-label">体态信息</div>
                        <div class="body-info-value">${student.body_info}</div>
                    </div>
                `;

                    resultsList.appendChild(resultItem);
                });
            })
            .catch(error => {
                console.error('请求失败:', error);
                resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>查询失败</p>
                    <span>${error.message}</span>
                </div>
            `;
                resultsCount.textContent = '0 位学生';
            });
    });
});