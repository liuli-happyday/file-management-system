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
      return name !== 'Login' && name !== 'Register';
    }
  }
}
</script>

<style lang="scss">
  @import "assets/scss/reset";
  /*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/
  ::-webkit-scrollbar
  {
    width: 8px;
    height: 8px;
    background-color: #F5F5F5;
  }

  /*定义滚动条轨道 内阴影+圆角*/
  ::-webkit-scrollbar-track
  {
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);
    border-radius: 10px;
    background-color: #F5F5F5;
  }

  /*定义滑块 内阴影+圆角*/
  ::-webkit-scrollbar-thumb
  {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(144,146,152,.3);
    background-color: rgba(144,146,152,.3);
  }
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
