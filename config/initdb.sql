-- 创建账号信息表
CREATE TABLE userinfo (
    uuid VARCHAR(36) PRIMARY KEY NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('user', 'manager', 'admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    token VARCHAR(255),
    FOREIGN KEY (uuid) REFERENCES userinfo(uuid) ON DELETE CASCADE
);

-- 创建用户数据表
CREATE TABLE userdata (
    uuid VARCHAR(36) PRIMARY KEY NOT NULL UNIQUE,
    userid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50),
    gender ENUM('男', '女', '未设置'),
    school VARCHAR(30),
    birthdate TIMESTAMP,
    tel CHAR(11),
    schoolid BIGINT
);

-- 创建上传图片信息表
CREATE TABLE submitfile (
    submissionid INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL,
    fileinfo VARCHAR(20) NOT NULL,
    filename VARCHAR(50) NOT NULL,
    uploaddate DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (uuid) REFERENCES userinfo(uuid) ON DELETE CASCADE
);