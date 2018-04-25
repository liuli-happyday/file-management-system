import { Message } from 'element-ui';
import auth from '@/service/auth';

function errorHandler(data) {
  const { msg } = data;

  Message.error({
    message: msg || '请求出错, 请稍后重试', // 请求出错, 请稍后重试
    duration: 3000
  });
}

export default (instance) => {
  // Add a response interceptor
  instance.interceptors.response.use((response) => {
    const data = response.data;

    if (+data.status === 0) {
      if (response.config.showDefaultError !== false) {
        errorHandler(data);
      }
      if (data.error === '10000') {
        auth.logout();
      }
    } else if (+data.status === 1 && data.error === '70000104') {
      // auth.expireToLogin();
      return;
    }

    return response;
  }, (error) => {
    // Do something with response error
    const data = {
      error,
      msg: ''
    };

    if (error.response) {
      data.msg = error.response.data && error.response.data.msg;
    } else {
      data.msg = error.message;
    }

    errorHandler(data);

    return Promise.reject(error);
  });
};
