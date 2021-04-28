<template>
    <div class="top_bar">
      <h2><span @click="toggleMenu" class="el-icon-menu"></span> 文件管理系统</h2>
      <!--<div class="current_time">{{ clock }}</div>-->
      <div class="user_info">
        <span>hello, {{ userName }}</span>
        <a @click="logout" href="javascript:void(0);">注销</a>
      </div>
    </div>
</template>

<script>
  import EventBus from '@/libs/event-bus';

  export default {
    name: 'topBar',
    data() {
      return {
        userName: '',
        clock: '2018-04-25 18:39:01'
      }
    },
    methods: {
      logout() {
        this.$api.logout({ name: 'admin' }).then((res) => {
          window.localStorage.removeItem('name');
          window.localStorage.removeItem('token');
          this.$router.replace({ path: '/' });
        });
      },
      loginEvent() {
        this.userName = window.localStorage.getItem('name');
      },
      listenEvent() {
        EventBus.$on('LOGIN', this.loginEvent);
      },
      toggleMenu() {
        EventBus.$emit('toggleMenu');
      },
    },
    destroyed() {
      EventBus.$off('LOGIN', this.loginEvent);
    },
    created() {
      // console.log('created top bar');
      this.userName = window.localStorage.getItem('name');
      this.listenEvent();
    }
  }
</script>

<style lang="scss" scoped>
  .top_bar{
    padding: 10px 20px;
    border-bottom: 1px solid #aaa;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .user_info{
    height: 20px;
    line-height: 20px;
    span{
      margin-right: 20px;
    }
  }
</style>
