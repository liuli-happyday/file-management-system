<template>
  <div class="login">
    <el-form ref="form" :model="form" :rules="rules" class="login_form" @submit.native="login">
      <el-form-item label="用户名" prop="name">
        <el-input class="login_form_input" v-model="form.name" :autofocus="true"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-input class="login_form_input" v-model="form.pwd" type="password"></el-input>
      </el-form-item>
      <el-form-item class="login_form_button">
        <el-button native-type="submit" type="primary">登 录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import md5 from 'blueimp-md5';
  import eventBus from '@/libs/event-bus';

  export default {
    name: 'login',
    data() {
      return {
        form: {
          name: '',
          pwd: ''
        },
        rules: {
          name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ],
          pwd: [
            { required: true, message: '请输入密码', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      login(e) {
        e.preventDefault();
        this.$refs.form.validate((val) => {
          if (val) {
            const params = {
              name: this.form.name,
              pwd: md5(this.form.pwd)
            };
            this.$api.login(params).then((res) => {
              // console.log(res);
              window.localStorage.setItem('name', this.form.name);
              window.localStorage.setItem('token', res.data.token);
              eventBus.$emit('LOGIN');
              this.$router.push({ path: '/main' });
            });
          }
        });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .login{
    position: relative;
    height: 100%;
    width: 100%;
    /*background-image: url("../../assets/imgs/login_bg.jpg");*/
    background-image: linear-gradient(45deg, #ddd, #00dbde);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }
  .login_form{
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*border: 1px solid #ddd;*/
    border-radius: 6px;
    width: 416px;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .login_form_button{
    text-align: center;
  }
  .login_form_input{
    input{
      background-color: transparent;
    }
  }
</style>
