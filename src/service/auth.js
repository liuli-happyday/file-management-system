
import API from '../api';
import Router from '@/router';

export default {
  logout() {
    API.logout({ name: 'admin' }).then((res) => {
      window.localStorage.removeItem('name');
      window.localStorage.removeItem('token');
      Router.replace({ path: '/' });
    });
  }
};
