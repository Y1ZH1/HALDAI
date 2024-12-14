// config/db.js
const mysql = require('mysql2');

// 创建 MySQL 连接池
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'mydb'
});

module.exports = db;
