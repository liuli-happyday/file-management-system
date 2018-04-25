import axios from 'axios';
import showLoading from './interceptors/show-loading';
import errorHandler from './interceptors/error-handler';

const instance = axios.create({
  timeout: 30000,
  transformResponse: [(data) => {
    // Do whatever you want to transform the data
    if (data && typeof data === 'string') {
      data = data.replace(/:\s*(\d{15,})/g, ':"$1"');
    }
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = {};
    }
    return data;
  }]
});

// 添加 showLoading 配置项
// 是否显示请求 loading
showLoading(instance);

// 添加 showDefaultError 配置项
// 是否默认错误处理
errorHandler(instance);

export default instance;
