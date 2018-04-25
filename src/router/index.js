import Vue from 'vue';
import Router from 'vue-router';
import Login from '../views/login';
import Main from '../views/main';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path: '/main',
      name: 'Main',
      component: Main
    }
  ]
})
