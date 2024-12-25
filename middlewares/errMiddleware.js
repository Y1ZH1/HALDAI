// middlewares/errMiddleware.js

const path = require('path');

// 默认错误捕获页
const defaultErrPage = (err, req, res, next) => {
    console.log(`ERR [${req.requestTime.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}]: ` + err);
    res.status(500).sendFile(path.join(__dirname, '..', 'public/err/500.html'));
}

// 404 错误页
const notFoundPage = (req, res, next) => {
    console.log(`ERR [${req.requestTime.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}]: 404请求，请求路由: ` + req.path);
    res.status(404).sendFile(path.join(__dirname, '..', 'public/err/404.html'));
}

module.exports = {
    defaultErrPage,
    notFoundPage,
}
