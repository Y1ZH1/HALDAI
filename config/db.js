// config/db.js
const mysql = require('mysql2');

// 创建 MySQL 连接池
const db = mysql.createPool({
  host: '8.130.53.139',
  user: 'mydb',
  password: 'zRDfAEEMGChfx4K8',
  database: 'mydb'
});

module.exports = db;
