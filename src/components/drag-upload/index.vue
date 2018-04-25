<template>
    <div class="upload_file">
      <el-upload
        :action="actionUrl"
        name="file"
        drag
        style="width: 100%;"
        :data="data"
        :headers="headers"
        :show-file-list="false"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="handleBeforeUpload"
        :on-progress="handleProgress">
        <!--<el-button size="small" type="primary">上传文件</el-button>-->
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <!--上传中。。。-->
      <div class="uploading" v-show="showUploading">
        <div class="uploading_text">
          <div><i class="el-icon-loading"></i></div>
          <div>{{ uploadingText }}</div>
        </div>
      </div>
    </div>
</template>

<script>
  import config from '@/config/env'

  export default {
    name: 'uploadFile',
    props: {
      parentId: {
        type: Number,
        default: 0
      }
    },
    data() {
        return {
          uploadingText: '已上传0%...',
          showUploading: false,
          headers: {},
          data: {
            parentId: 0,
            icon: ''
          },
          actionUrl: config.baseUrl + '/uploadFile'
        };
    },
    watch: {
      parentId(val) {
        this.data.parentId = val;
        this.data.token = window.localStorage.getItem('token');
      }
    },
    methods: {
      handleSuccess(res, file, fileList) {
        // console.log(res, file, fileList);
        if (+res.status === 1) {
          this.$message.success('上传成功');
          this.$emit('uploadSuccess');
        } else {
          this.$message.error('上传失败');
        }
        this.showUploading = false;
      },
      handleError(err, file, fileList) {
        // console.log(err, file, fileList);
        this.showUploading = false;
        this.$message.error('上传失败');
      },
      handleProgress(event, file, fileList) {
        // console.log(event, file, fileList);
        const percent = event.percent.toFixed(2);
        this.uploadingText = `已上传${percent}%...`;
        if (event.percent === 100) {
          this.showUploading = false;
        }
        // console.log(this.uploadingText);
      },
      handleBeforeUpload(file) {
        // console.log(file);
        const arr = file.name.split('.');
        const ext = arr[arr.length - 1];
        this.data.icon = this.switchIcon(ext);
        this.uploadingText = '已上传0%...';
        this.showUploading = true;
        this.headers.token = window.localStorage.getItem('token');
      },
      switchIcon(ext) {
        // 转换文件图标
        if (ext) {
          ext = ext.toLowerCase();
        }
        switch (ext) {
          case 'doc':
          case 'docx':
            return 'icon-word';
          case 'xls':
          case 'xlsx':
            return 'icon-excel';
          case 'ppt':
          case 'pptx':
            return 'icon-ppt';
          case 'pdf':
            return 'icon-pdf';
          case 'apk':
            return 'icon-apk';
          case 'txt':
            return 'icon-txt';
          case 'visio':
            return 'icon-visio';
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'bmp':
          case 'gif':
            return 'icon-image';
          case 'rar':
          case 'zip':
          case '7z':
          case 'iso':
          case 'cab':
            return 'icon-rar';
          default:
            return 'icon-file';
        }
      }
    },
    created() {
      this.data.parentId = this.parentId;
      this.data.token = window.localStorage.getItem('token');
    }
  }
</script>

<style lang="scss" scoped>
  .uploading{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 101;
  }
  .uploading_text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
    font-size: 18px;
    .el-icon-loading{
      font-size: 30px;
      margin-bottom: 15px;
    }
  }
</style>
