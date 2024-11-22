// config/db.js
const mysql = require('mysql2');

// 创建 MySQL 连接池
const db = mysql.createPool({
  host: '172.29.160.151',
  user: 'mydb',
  password: 'zRDfAEEMGChfx4K8',
  database: 'mydb'
});

module.exports = db;
