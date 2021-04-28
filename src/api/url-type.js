/**
 * API列表，建议最多两层嵌套
 *
 * url值的格式为 String/Object
 * String: url的值
 * Object：{ // axios config options
 *  url: '',
 *  method: '',// get/post/put/delete, 为URL的请求方法，不写默认为post
 *  baseUrl: ''
 * }
 */

export default {
  login: '/login',  // 登录
  logout: '/logout',  // 登出
  register: '/register',  // 注册
  getFolderList: '/getFolderList',  // 获取文件夹列表
  getFileList: '/getFileList', // 获取文件列表
  createFolder: '/createFolder', // 创建文件夹
  editFolder: '/editFolder', // 修改文件夹
  uploadFile: '/uploadFile', // 上传文件
  delFileAndFolder: '/delFileAndFolder', // 删除文件|文件夹
  download: {
    url: '/download',
    method: 'get'
  }, // 下载文件
  sendMail: '/sendMail', // 发送提醒邮件
};
