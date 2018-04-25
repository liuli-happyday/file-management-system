<template>
    <div class="top_bar">
      <h2>文件管理系统</h2>
      <div class="user_info">
        <span>{{ userName }}</span>
        <a @click="logout" href="javascript:void(0);">注销</a>
      </div>
    </div>
</template>

<script>
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
      listenEvent() {
        //
      }
    },
    created() {
      console.log('created top bar');
    }
  }
</script>

<style lang="scss" scoped>
  .top_bar{
    padding: 10px 20px;
    border-bottom: 1px solid #aaa;
    display: flex;
    justify-content: space-between;
  }
</style>
