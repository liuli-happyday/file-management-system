# file-management-system
文件管理系统

## 建表语句，初始化根文件夹
``` sql
# 用户表
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `username` varchar(128) NOT NULL DEFAULT '' COMMENT '用户名',
  `password` varchar(128) NOT NULL DEFAULT '' COMMENT '密码',
  `nickname` varchar(128) NOT NULL DEFAULT '' COMMENT '昵称',
  `remark` varchar(256) NOT NULL DEFAULT '' COMMENT '描述',
  `status` int(1) NOT NULL DEFAULT '1' COMMENT '状态（0：已删除，1：正常）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `update_time` (`update_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='用户表';

INSERT INTO t_user (username, password) VALUES ('hello', '7d793037a0760186574b0282f2f435e7');

# 文件表
DROP TABLE IF EXISTS `t_file_folder`;
CREATE TABLE `t_file_folder` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(128) NOT NULL DEFAULT '' COMMENT '文件名|文件夹名',
  `parent_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '父级ID',
  `type` varchar(128) NOT NULL DEFAULT 'folder' COMMENT '文件|文件夹',
  `icon` varchar(128) NOT NULL DEFAULT 'icon-file' COMMENT '文件图标',
  `path` varchar(255) NOT NULL DEFAULT '' COMMENT '路径',
  `size` varchar(255) NOT NULL DEFAULT '' COMMENT '文件大小',
  `status` int(1) NOT NULL DEFAULT '1' COMMENT '状态（0：已删除，1：正常）',
  `root` int(1) NOT NULL DEFAULT '0' COMMENT '是否是根节点',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `update_time` (`update_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COMMENT='文件表';


INSERT INTO t_file_folder (name, root) VALUES ('PinjamanGo', '1');
```

## 前端开发、编译
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```


## 服务端
``` bash
# 进入服务端文件夹
cd service

# 安装依赖
npm install

# 修改数据库信息
const pool = mysql.createPool({
  host     : 'localhost',
  port     : '12345',
  user     : 'root',
  password : '123456',
  database : 'db'
});

# 开启服务端服务
node index.js

# 打开浏览器输入localhost:3000

```




