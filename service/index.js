const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const md5 = require('blueimp-md5');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const nodemailer = require('nodemailer');
// 获取本机IP
let IPv4, hostName;
hostName = os.hostname();

const netList = os.networkInterfaces().WLAN || os.networkInterfaces().eth0 || os.networkInterfaces().en0 || [];

netList.forEach((item) => {
  if(item.family === 'IPv4'){
    IPv4 = item.address;
  }
});

// 邮箱设置
const mailTransport = nodemailer.createTransport({
  host : 'smtp.126.com',
  secure: true,
  auth : {
    user : 'zhangsan@126.com',
    pass : 'zhangsan'
  },
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

//设置跨域访问
// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1');
//   res.header("Content-Type", "application/json;charset=utf-8");
//   if (req.method === 'OPTIONS') {
//     res.send(200);
//   } else {
//     next();
//   }
// });

app.use(express.static('static'));
app.use('/' + downloadPath, express.static('uploads'));

const mysql      = require('mysql');


const pool = mysql.createPool({
  host     : '192.168.100.100',
  port     : '3306',
  user     : 'root',
  password : 'password',
  database : 'file_management'
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
        const user = results[0];
        const token = md5(Date.now());
        tokenList.push({
          username: name,
          token,
          admin: user.admin,
          time: Date.now()
        });
        res.send({
          status: 1,
          data: {
            name,
            token,
            admin: user.admin,
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
// 注册
app.post('/register', (req, res) => {
  // console.log(req);
  const name = req.body.name;
  const pwd = req.body.pwd;
  // 因为内部使用，没有短信发送验证只直接写死了口令
  // 口令:HelloWorld
  const word = req.body.word;
  if (word !== '68e109f0f40ca72a15e05cc22786f8e6') {
    // 如果口令不对，直接返回错误
    res.send({
      status: 0,
      data: null,
      msg: '口令错误'
    });
    return;
  }
  //
  if (name && pwd) {
    const p = new Promise((resolve, reject) => {
      // 判断用户是否存在
      queryDB(`SELECT * FROM t_user where username = "${name}"`, (results, fields) => {
        if (results.length === 0) {
          resolve();
        } else {
          reject('该用户已存在');
        }
      });
    });
    p.then(() => {
      queryDB(`INSERT INTO t_user (username, password) VALUES ('${name}', '${pwd}');`, (results) => {
        const token = md5(Date.now());
        tokenList.push({
          username: name,
          token,
          admin: 0,
          time: Date.now()
        });
        res.send({
          status: 1,
          data: {
            name,
            token,
            admin: 0
          },
          msg: '注册成功'
        });
      });
    }).catch(msg => {
      res.send({
        status: 0,
        data: null,
        msg
      });
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
    queryDB(`SELECT id, name, parent_id as parentId, root, create_time as createTime, creator FROM t_file_folder where type = "folder" and status = 1`, (results) => {
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
  const pageNo = req.body.pageNo;
  const pageSize = req.body.pageSize;
  const downloadPrefix = req.body.downloadPrefix;
  if (!isEffective(req)) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  const numRex = /^\d+$/;
  if (numRex.test(parentId) && numRex.test(pageNo) && numRex.test(pageSize)) {
    // parent_id = ${parentId} and
    new Promise((resolve, reject) => {
      // 查询总数
      queryDB(`SELECT COUNT(id) AS count FROM t_file_folder where parent_id = ${parentId} and type = "file" and status = 1;`, (results) => {
        resolve(results);
      });
    }).then((count) => {
      // 查询列表
      const index = pageSize * (pageNo - 1);
      const queryStr = `SELECT id, name as fileName, size, path, icon, update_time as updateTime, create_time as createTime, creator FROM t_file_folder
      where parent_id = ${parentId} and type != "folder" and status = 1 ORDER BY updateTime desc
      LIMIT ${index}, ${pageSize}`;
      queryDB(queryStr, (results) => {
        // token todo
        results.forEach((item) => {
          // item.url = `http://${IPv4}:${port}/download/${item.path}/${item.fileName}`;
          if (downloadPrefix && downloadPrefix.indexOf('localhost:') === -1) {
            item.url = `${downloadPrefix}/download/${item.path}/${item.fileName}`;
          } else {
            item.url = `http://192.168.100.11:${port}/download/${item.path}/${item.fileName}`;
          }
          item.updateTime = new Date(item.updateTime).getTime();
        });
        res.send({
          status: 1,
          data: {
            page: {
              pageNo,
              pageSize,
              totalRecords: count[0].count
            },
            list: results
          },
          msg: ''
        });
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
  const tokenInfo = isEffective(req);
  if (!tokenInfo) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (name && parentId) {
    queryDB(`INSERT INTO t_file_folder (name, parent_id, type, creator) VALUES ('${name}', ${parentId}, 'folder', '${tokenInfo.username}');`, (results) => {
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
  const tokenInfo = isEffective(req);
  if (!tokenInfo) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (name && id) {
    // 判断是否有权限操作
    const p = new Promise((resolve, reject) => {
      queryDB(`select * from t_file_folder WHERE id = ${id};`, (results) => {
        if (results.length === 1) {
          const folder = results[0];
          if (folder.creator === tokenInfo.username) {
            resolve();
          } else {
            reject('无权操作');
          }
        } else {
          reject('没有该文件夹');
        }
      });
    });
    p.then(() => {
      // 执行更新操作
      queryDB(`UPDATE t_file_folder SET name  = '${name}' WHERE id = ${id};`, (results) => {
        res.send({
          status: 1,
          data: 'success',
          msg: '修改成功'
        });
      });
    }).catch(msg => {
      res.send({
        status: 0,
        data: null,
        msg
      });
    });
  }
});
//删除文件|文件夹
app.post('/delFileAndFolder', (req, res) => {
  const id = req.body.id;
  const tokenInfo = isEffective(req);
  if (!tokenInfo) {
    res.send({
      status: 0,
      data: false,
      msg: '登录过期',
      error: '10000'
    });
    return;
  }
  if (id) {
    // 判断是否有权限操作
    const p = new Promise((resolve, reject) => {
      queryDB(`select * from t_file_folder WHERE id = ${id};`, (results) => {
        if (results.length === 1) {
          const folder = results[0];
          if (folder.creator === tokenInfo.username) {
            resolve();
          } else {
            reject('无权操作');
          }
        } else {
          reject('操作失败');
        }
      });
    });
    p.then(() => {
      // 判断文件夹是否为空
      const promise = new Promise((resolve, reject) => {
        queryDB(`SELECT * FROM t_file_folder WHERE id = ${id};`, (results) => {
          resolve(results);
        });
      });
      promise.then((results) => {
        if (results && results.length > 0) {
          const f = results[0];
          if (f.type === 'folder') {
            // 如果是文件夹，查询文件夹中是否有子项
            const p = new Promise((resolve, reject) => {
              queryDB(`SELECT * FROM t_file_folder WHERE parent_id = ${f.id} AND \`status\` = 1;`, (results) => {
                if (results && results.length > 0) {
                  reject('文件夹不为空');
                } else {
                  // 文件夹为空
                  resolve(results);
                }
              });
            });
            return p;
          } else {
            // 如果是文件
            return Promise.resolve(results);
          }
        } else {
          return Promise.reject('删除失败');
        }
      }).then(() => {
        queryDB(`UPDATE t_file_folder SET STATUS = '0' WHERE id = ${id};`, (results) => {
          res.send({
            status: 1,
            data: 'success',
            msg: '删除成功'
          });
        });
      }).catch((msg) => {
        res.send({
          status: 0,
          data: 'error',
          msg
        });
      });
    }).catch(msg => {
      res.send({
        status: 0,
        data: null,
        msg
      });
    });
  }
});
//上传文件
app.post('/uploadFile', (req, res) => {
  const parentId = req.body.parentId;
  const file = req.file;
  const icon = req.body.icon;
  const tokenInfo = isEffective(req);
  if (!tokenInfo) {
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
          (name, parent_id, type, icon, path, size, creator)
          VALUES
          ('${originalname}', ${parentId}, 'file', '${icon}', '${filename}', ${size}, '${tokenInfo.username}');`;
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

// 发送邮件
/* 浏览器输入地址（如127.0.0.1:3000/sned）后即发送 */
app.post('/sendMail', (req, res, next) => {
  const { sender, to, cc, subject, text, attachments } = req.body;
  const receive = calcEmailAddress(to);
  const copy = calcEmailAddress(cc);
  const options = {
    from: `"文件更新--${sender}" <zhangsan@126.com>`,
    to: receive,
    cc: copy,  //抄送
    // bcc: ''    //密送
    subject: subject || '文件管理系统',
    text: text || '文件更新',
    attachments: []
    // html           : '<h1>你好，这是一封来自NodeMailer的邮件！</h1><p><img src="cid:00000001"/></p>',
    // attachments :
    //   [
    //     {
    //       filename: 'img1.png',            // 改成你的附件名
    //       path: 'public/images/img1.png',  // 改成你的附件路径
    //       cid : '00000001'                 // cid可被邮件使用
    //     },
    //     {
    //       filename: 'img2.png',            // 改成你的附件名
    //       path: 'public/images/img2.png',  // 改成你的附件路径
    //       cid : '00000002'                 // cid可被邮件使用
    //     },
    //   ]
  };
  attachments.forEach((file) => {
    options.attachments.push({
      filename: file.fileName, // 改成你的附件名
      path: `uploads/${file.path}-${file.fileName}`, // 改成你的附件路径
      // path: file.url, // 改成你的附件路径
      cid : file.path // cid可被邮件使用
    });
  });
  console.log(options);
  // res.render('index', { title: "已接收："});
  mailTransport.sendMail(options, (err, msg) =>{
    if(err){
      console.log(err);
      res.send({
        status: 0,
        data: 'error',
        msg: '发送失败'
      });
    }
    else {
      console.log(msg);
      res.send({
        status: 1,
        data: { title: "已接收："+msg.accepted},
        msg: '发送成功'
      });
    }
  });
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
  const cache = {};
  const now = Date.now();
  const time = 1000 * 60 * 60 * 2; // 默认失效时间2小时
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
      cache.effective = true;
      cache.username = item.username;
      cache.admin = item.admin;
    }
  }
  if (effective) {
    return cache;
  } else {
    return effective;
  }
};

const calcEmailAddress = (str) => {
  const emailReg = /^[\w-.]+@[\w-]+(.[\w_-]+)+$/;
  let receive = null;
  receive = str.split(',');
  receive.forEach((item, index) => {
    item = item.trim();
    if (item) {
      if (item.indexOf('@') === -1) {
        item = `${item}@pinjamango.com`;
      } else if(!emailReg.test(item)){
        item = '';
      }
    } else {
      item = '';
    }
    receive[index] = item;
  });
  while (receive.indexOf('') > -1) {
    receive.splice(receive.indexOf(''), 1);
  }
  return receive.join(',');
};

