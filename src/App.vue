<template>
  <div id="app">
    <top-bar v-show="showBar" /><!--头部-->
    <router-view/>
  </div>
</template>

<script>
  import TopBar from './components/top-bar';

export default {
  name: 'App',
  components: {
    TopBar
  },
  computed: {
    showBar() {
      const { name } = this.$route;
      // console.log(this.$route);
      return name !== 'Login';
    }
  }
}
</script>

<style lang="scss">
  @import "assets/scss/reset";
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  /*margin-top: 60px;*/
  display: flex;
  flex-direction: column;
  height: 100%;
}
  .el-input__inner{
    background-color: transparent;
  }
  .el-upload, .el-upload-dragger{
    width: 100%;
  }
</style>
