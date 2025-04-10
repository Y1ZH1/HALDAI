// middlewares/errMiddleware.js

const path = require('path');

// 默认错误捕获页
const defaultErrPage = (err, req, res, next) => {
    req.log_ERR('',err);
    return res.status(500).sendFile(path.join(__dirname, '..', 'public/err/500.html'));
}

// 404 错误页
const notFoundPage = (req, res, next) => {
    req.log_INFO('404请求，请求路由: ' + req.path);
    return res.status(404).sendFile(path.join(__dirname, '..', 'public/err/404.html'));
}

module.exports = {
    defaultErrPage,
    notFoundPage,
}
