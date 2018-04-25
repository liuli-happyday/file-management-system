<template>
    <div class="top_bar">
      <h2>文件管理系统</h2>
      <div class="user_info">
        <span>hello, {{ userName }}</span>
        <a @click="logout" href="javascript:void(0);">注销</a>
      </div>
    </div>
</template>

<script>
  import eventBus from '@/libs/event-bus';

  export default {
    name: 'topBar',
    data() {
      return {
        userName: ''
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
        eventBus.$on('LOGIN', this.loginEvent);
      }
    },
    destroyed() {
      eventBus.$off('LOGIN', this.loginEvent);
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
