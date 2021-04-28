<template>
  <div v-if="visible" class="show_image_mask">
    <img ref="image" draggable="true" :class="rotateCls" @dblclick="close" class="show_image_dialog" v-if="imgSrc" :src="imgSrc" alt="">
    <video v-if="videoSrc" class="video_dialog" controls>
      <source :src="videoSrc" type="video/ogg">
      Your browser is not support HTML5 video element.
    </video>
    <span @click="close" class="show_image_close el-icon-close"></span>
    <div v-if="imgSrc" class="rotate_btns">
      <button class="rotate_btn_left" @click="rotateToLeft"></button>
      <button class="scale_btn" @click="zoomOut"><i class="el-icon-zoom-out"></i></button>
      <button class="scale_btn" @click="zoomIn"><i class="el-icon-zoom-in"></i></button>
      <button class="rotate_btn_right" @click="rotateToRight"></button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'showImageDialog',
    props: {
      imgSrc: {
        type: String,
        default: ''
      },
      videoSrc: {
        type: String,
        default: ''
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      visible(val) {
        this.deg = 0;
        this.scale = 1;
        this.marginTop = 0;
        this.marginLeft = 0;
        if (val) {
          this.$nextTick(() => {
            this.moveImg();
          });
        }
      },
    },
    data() {
      return {
        showImage: false,
        deg: 0, // 旋转角度
        rotateCls: '',
        scale: 1, // 缩放比例
        marginTop: 0,
        marginLeft: 0,
        hasBound: false
      };
    },
    methods: {
      close() {
        this.$emit('update:visible', false);
      },
      rotateToRight() {
        this.deg = (this.deg + 90) % 360;
        this.calcImg();
      },
      rotateToLeft() {
        this.deg = (((this.deg - 90) % 360) + 360) % 360;
        this.calcImg();
      },
      zoomIn() {
        this.scale += 0.5;
        this.calcImg();
      },
      zoomOut() {
        if (this.scale > 0) {
          this.scale -= 0.5;
          this.calcImg();
        }
      },
      calcImg() {
        const img = this.$refs.image;
        if (this.imgSrc && img) {
          const transform = `translate(-50%, -50%) rotate(${this.deg}deg) scale(${this.scale})`;
          img.style.WebkitTransform = transform;
          img.style.MozTransform = transform;
          img.style.MsTransform = transform;
          img.style.transform = transform;
        }
      },
      moveImg() {
        const img = this.$refs.image;
        if (this.imgSrc && img) {
          // this.hasBound = true;
          let startX = 0;
          let startY = 0;
          let enter = false;
          let initX = 0;
          let initY = 0;
          img.addEventListener('mousedown', (e) => {
            e.preventDefault();
            enter = true;
            startX = e.clientX;
            startY = e.clientY;
            initX = this.marginLeft;
            initY = this.marginTop;
          });
          img.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (enter) {
              this.marginTop = initY + (e.clientY - startY);
              this.marginLeft = initX + (e.clientX - startX);
              img.style.marginTop = this.marginTop + 'px';
              img.style.marginLeft = this.marginLeft + 'px';
            }
          });
          img.addEventListener('mouseup', (e) => {
            e.preventDefault();
            enter = false;
          });
          img.addEventListener('mouseout', (e) => {
            e.preventDefault();
            enter = false;
          });
        }
      }
    },
    created() {
    }
  };
</script>

<style lang="scss" scoped>
  button{
    outline: none;
    cursor: pointer;
  }
  .show_image_mask{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }
  .show_image_dialog, .video_dialog{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0;
    line-height: 0;
    max-width: 90%;
    max-height: 90%;
  }
  .show_image_dialog{
    cursor: move;
  }
  .show_image_close{
    position: absolute;
    top: 10px;
    right: 10px;
    color: #fff;
    font-size: 40px;
    cursor: pointer;
  }
  .rotate_btns{
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translate(-50%, 0);
  }
  .rotate_0{
    transform: translate(-50%, -50%) rotate(0deg);
  }
  .rotate_90{
    transform: translate(-50%, -50%) rotate(90deg);
  }
  .rotate_180{
    transform: translate(-50%, -50%) rotate(180deg);
  }
  .rotate_270{
    transform: translate(-50%, -50%) rotate(270deg);
  }
  .rotate_btn_left, .rotate_btn_right{
    color: #fff;
    font-size: 25px;
    /*background: none;*/
    /*background-color: rgba(0, 0, 0, 0.2);*/
    border: none;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    background-image: url("~@/assets/imgs/rotate.png");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-color: transparent;
    height: 50px;
    width: 50px;
    vertical-align: middle;
  }
  .rotate_btn_right{
    transform: rotateY(180deg);
  }
  .scale_btn{
    color: #fff;
    border: none;
    background: none;
    font-size: 36px;
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
    margin-left: 30px;
    height: 50px;
    line-height: 50px;
    vertical-align: middle;
  }
  .scale_btn + .scale_btn{
    margin-right: 30px;
  }
</style>
