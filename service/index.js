const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const md5 = require('blueimp-md5');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
// 获取本机IP
let IPv4, hostName;
hostName = os.hostname();

const netList = os.networkInterfaces().WLAN || os.networkInterfaces().eth0 || [];

netList.forEach((item) => {
  if(item.family === 'IPv4'){
    IPv4 = item.address;
  }
});

const upload = multer({ dest: './temp' });

const app = express();
const port = 3000;  // 端口号
const downloadPath = 'files'; // 下载地址

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(upload.single('file'));

const tokenList = [];


app.use(express.static('static'));
app.use('/' + downloadPath, express.static('uploads'));

const mysql      = require('mysql');


const pool = mysql.createPool({
  host     : 'localhost',
  port     : '12345',
  user     : 'root',
  password : '123456',
  database : 'db'
});

// connection.connect();
// 登录
app.post('/login', (req, res) => {
  // console.log(req);
  const name = req.body.name;
  const pwd = req.body.pwd;
  //
  if (name && pwd) {
    queryDB(`SELECT * FROM t_user where username = "${name}" and password = "${pwd}"`, (results, fields) => {
      if (results.length === 1) {
        const token = md5(Date.now());
        tokenList.push({
          username: name,
          token,
          time: Date.now()
        });
        res.send({
          status: 1,
          data: {
            token
          },
          msg: ''
        });
      } else {
        res.send({
          status: 0,
          data: null,
          msg: '用户名或密码错误'
        });
      }
    });
  } else {
    res.send({
      status: 0,
      data: null,
      msg: '请输入用户名和密码'
    });
  }
});
// 退出
app.post('/logout', (req, res) => {
  // console.log(req);
  const name = req.body.name;
  const token = req.body.token;
  //
  if (name) {
    tokenList.forEach((item, index) => {
      if (item.token === token) {
        tokenList.splice(index, 1);
      }
    });
    res.send({
      status: 1,
      data: 1,
      msg: '成功注销'
    });
  }
});
//获取文件夹列表
app.post('/getFolderList', (req, res) => {
  const parentId = req.body.parentId;
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (/^\d+$/.test(parentId)) {
    // parent_id = ${parentId} and
    queryDB(`SELECT id, name, parent_id as parentId, root, create_time as createTime FROM t_file_folder where type = "folder" and status = 1`, (results) => {
      // token todo
      results.forEach((item) => {
        item.createTime = new Date(item.createTime).getTime();
      });
      res.send({
        status: 1,
        data: results,
        msg: ''
      });
    });
  } else {
    res.send({
      status: 0,
      data: '',
      msg: '参数有误'
    });
  }
});
//获取文件列表
app.post('/getFileList', (req, res) => {
  const parentId = req.body.parentId;
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (/^\d+$/.test(parentId)) {
    // parent_id = ${parentId} and
    queryDB(`SELECT id, name as fileName, path, icon, update_time as updateTime FROM t_file_folder where parent_id = ${parentId} and type = "file" and status = 1`, (results) => {
      // token todo
      results.forEach((item) => {
        // item.url = `http://${IPv4}:${port}/download/${item.path}/${item.fileName}`;
        item.url = `http://47.98.125.20:${port}/download/${item.path}/${item.fileName}`;
        item.updateTime = new Date(item.updateTime).getTime();
      });
      res.send({
        status: 1,
        data: results,
        msg: ''
      });
    });
  } else {
    res.send({
      status: 0,
      data: '',
      msg: '参数有误'
    });
  }
});
//新建文件夹
app.post('/createFolder', (req, res) => {
  const parentId = req.body.parentId;
  let name = req.body.name;
  if (name) {
    name = name.trim();
  }
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (name && parentId) {
    queryDB(`INSERT INTO t_file_folder (name, parent_id, type) VALUES ('${name}', ${parentId}, 'folder');`, (results) => {
      res.send({
        status: 1,
        data: 'success',
        msg: '新建成功'
      });
    });
  }
});
//编辑文件夹
app.post('/editFolder', (req, res) => {
  const id = req.body.id;
  let name = req.body.name;
  if (name) {
    name = name.trim();
  }
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (name && id) {
    queryDB(`UPDATE t_file_folder SET name  = '${name}' WHERE id = ${id};`, (results) => {
      res.send({
        status: 1,
        data: 'success',
        msg: '修改成功'
      });
    });
  }
});
//删除文件|文件夹
app.post('/delFileAndFolder', (req, res) => {
  const id = req.body.id;
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (id) {
    queryDB(`UPDATE t_file_folder SET STATUS = '0' WHERE id = ${id};`, (results) => {
      res.send({
        status: 1,
        data: 'success',
        msg: '删除成功'
      });
    });
  }
});
//上传文件
app.post('/uploadFile', (req, res) => {
  const parentId = req.body.parentId;
  const file = req.file;
  const icon = req.body.icon;
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (parentId && file) {
    // const saveFile = __dirname + '/uploads/' + Date.now() + '-' + file.originalname;
    const { size, originalname, filename, path } = file;
    // const saveFile = `${__dirname}/${downloadPath}/${file.originalname}`;
    const saveFile = `${__dirname}/uploads/${filename}-${originalname}`;
    // console.log(saveFile);
    fs.readFile(file.path, (err, data) => {
      fs.writeFile(saveFile, data, (err) => {
        if (err) {
          throw err;
        } else {
          const queryStr = `INSERT INTO t_file_folder 
          (name, parent_id, type, icon, path, size) 
          VALUES 
          ('${originalname}', ${parentId}, 'file', '${icon}', '${filename}', ${size});`;
          // console.log(queryStr);
          queryDB(queryStr, (results) => {
            res.send({
              status: 1,
              data: {
                fileName: file.originalname
              },
              msg: '上传成功'
            });
          });
        }
      });
    });
  }
});

app.get('/download/:code/:filename', (req, res) => {
  // const path = 'uploads/' + req.params.filename;
  const path = `uploads/${req.params.code}-${req.params.filename}`;
  res.download(path, req.params.filename);
});

// const server = app.listen(port, '0.0.0.0', () => {
app.listen(port, () => {
  // console.log(server.address());
  // console.log(`Service listening on port:${port}`);
  console.log('Service start at http://%s:%s', IPv4, port);
});

const queryDB = (query, callback) => {
  pool.getConnection((err, conn) => {
    if (err) console.log(err);
    conn.query(query, (err, results, fields) => {
      if (err) console.log(err);
      callback(results, fields);
      conn.release();
    });
  })
};


const isEffective = (req) => {
  const token = req.get('token') || req.body.token;
  if (!token) {
    return false;
  }
  let effective = false;
  const now = Date.now();
  const time = 1000 * 60 * 30;
  let i, length = tokenList.length;
  for (i = 0; i < length; i++) {
    const item = tokenList[i];
    if ((now - item.time) > time) {
      tokenList.splice(i, 1);
      i--;
      length = tokenList.length;
    } else if (item.token === token && (now - item.time) <= time) {
      item.time = now;
      effective = true;
    }
  }
  return effective;
};



