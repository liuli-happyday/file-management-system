import deepMerge from 'deepmerge';
import http from '@/libs/http';
import urls from './url-type';
import config from '../config/env'

const defaultConf = {
  method: 'post',
  data: {

  }
};

const BASEURL = config.baseUrl;

/**
 * 填充 baseUrl
 *
 * @param {any} url
 * @param {any} baseUrl
 * @returns
 */
function fillBaseUrl(url, baseUrl) {
  if (url.indexOf('//') > -1) {
    return url;
  }
  baseUrl = baseUrl || BASEURL;

  return `${baseUrl}${url}`;
}

/**
 * 组装http请求
 * @param  {[type]} urlVal [description]
 * @return {[type]}        [description]
 */
function assembleHttp(urlVal) {
  if (typeof urlVal === 'string') {
    urlVal = {
      url: urlVal,
      method: 'post'
    };
  }

  urlVal.url = fillBaseUrl(urlVal.url, urlVal.baseUrl);

  return (params = {}, config = {}) => {
    config = deepMerge.all([defaultConf, urlVal, config || {}]);

    const token = window.localStorage.getItem('token');
    if (['post', 'put', 'patch'].indexOf(config.method) > -1) {
      config.data = params;
      if (token) {
        config.data.token = token;
      }
    } else {
      config.params = params;
    }

    if (token) {
      config.headers = {
        token
      };
    }

    return http(config).then(response => response.data);
  };
}

/**
 * 填充方法
 * @param  {[type]} apiObj [description]
 * @param  {[type]} urls   [description]
 * @return {[type]}        [description]
 */
function fillMethods(apiObj, urls) {
  const urlKeys = Object.keys(urls);

  urlKeys.forEach((urlKey) => {
    const urlVal = urls[urlKey];

    if (typeof urlVal === 'string') {
      apiObj[urlKey] = assembleHttp(urlVal);
    } else if (urlVal.url) {
      apiObj[urlKey] = assembleHttp(urlVal);
    } else {
      apiObj[urlKey] = {};
      fillMethods(apiObj[urlKey], urlVal);
    }
  });
}

/**
 * Api 类
 */
class Api {
  /**
   * 作为Vue插件进行安装，挂载到Vue.prototype
   */
  install(Vue) {
    Vue.prototype.$api = this;
  }
}

fillMethods(Api.prototype, urls);


export default new Api(http);
