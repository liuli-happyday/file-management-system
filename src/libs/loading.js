import { Loading } from 'element-ui';

let loadingCount = 0;
let timeoutId = null;
let loadingInstance = null;

export default {
  show() {
    loadingCount++;

    if (loadingCount === 1) {
      timeoutId = setTimeout(() => {
        loadingInstance = Loading.service({
          customClass: 'comp-loading',
          lock: true,
          fullScreen: true
        });
      }, 300); // 300毫秒数据未返回显示loading
    }
  },

  close() {
    clearTimeout(timeoutId);
    if (loadingCount >= 1) {
      loadingCount--;
    }

    if (loadingCount === 0 && loadingInstance) {
      // 异步处理，防止同步调用 show 和 close 问题
      setTimeout(() => {
        loadingInstance.close();
        loadingInstance = null;
      }, 0);
    }
  }
}