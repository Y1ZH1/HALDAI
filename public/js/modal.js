// 开关交互框
export function activeModal(openBtn, closeBtn, modal, modalHeight = null, modalWidth = null, onOpenCallback = null, closeCallbback = null) {
    const modalContent = modal.querySelector('.modal-content');
    if (modalWidth) modalContent.style.width = modalWidth + 'px'; // 动态设置宽度
    if (modalHeight) modalContent.style.height = modalHeight + 'px';

    // 打开交互框
    openBtn.addEventListener('click', () => {
        if (onOpenCallback) onOpenCallback(); // 调用打开回调函数
        modal.classList.remove('hidden');   // 显示背景
        modal.classList.add('open');        // 显示交互框
        modalContent.classList.remove('close'); // 确保关闭类名被移除
    });

    // 关闭交互框
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');   // 背景立即隐藏
        modalContent.classList.add('close'); // 添加关闭动画
        setTimeout(() => {  // 延迟隐藏交互框，等待动画完成
            modal.classList.remove('open'); // 移除打开类名
        }, 100); // 与动画时间一致
        if (closeCallbback) closeCallbback();   // 调用关闭回调函数
    });
}