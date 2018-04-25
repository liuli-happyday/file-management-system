import loading from '@/libs/loading';

export default (instance) => {
  // Add a request interceptor
  instance.interceptors.request.use((config) => {
    if (config.showLoading !== false) {
      loading.show();
    }

    return config;
  }, (error) => {
    // Do something with request error
    if (error.config.showLoading !== false) {
      loading.close();
    }
    return Promise.reject(error);
  });

  // Add a response interceptor
  instance.interceptors.response.use((response) => {
    if (response.config.showLoading !== false) {
      loading.close();
    }
    return response;
  }, (error) => {
    // Do something with response error
    if (error && error.config && error.config.showLoading !== false) {
      loading.close();
    }

    return Promise.reject(error);
  });
};
