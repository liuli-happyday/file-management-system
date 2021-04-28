
import foldList from './fold-list';
// import UploadFile from '../../components/upload-file';
import UploadFile from '../../components/drag-upload';
// import axios from 'axios';
import showImageVideo from '../../components/show-image-video'
import EventBus from '@/libs/event-bus';

const storage = window.localStorage;

export default {
  name: 'filesList',
  components: {
    foldList,
    UploadFile,
    showImageVideo
  },
  data() {
    return {
      tableData: [],
      folderList: [],
      tempList: [],
      parentId: 0,
      isAdd: false,
      showUpload: false,
      page: {
        pageNo: 1,
        pageSize: 10,
        totalRecords: 0
      },
      selectedList: [],
      showEmailDialog: false,
      emailForm: {
        sender: '',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        text: ''
      },
      emailFormRules: {
        sender: [
          { required: true, message: '请输入发件人' }
        ],
        to: [
          { required: true, message: '请输入收件人' }
        ],
        cc: [],
        bcc: [],
        subject: [
          { required: true,  message: '请输入邮件主题' }
        ],
        text: [
          { required: true, message: '请输入邮件内容' }
        ]
      },
      showImageDialog: false,
      imgUrl: '',
      resizeMenu: false,
      resizeMenuX: 0,
      resizeMenuInitWidth: 0,
      username: storage.getItem('name'),
      showMenu: false, // 是否显示菜单
    };
  },
  methods: {
    getFolderList() {
      const params = {
        parentId: 0
      };
      this.$api.getFolderList(params).then((res) => {
        // console.log(res);
        this.tempList = [];
        res.data.forEach((item) => {
          this.tempList.push({
            id: item.id,
            name: item.name,
            rootFold: +item.root === 1,
            active: false,
            subMenu: [],
            parentId: item.parentId,
            createTime: item.createTime,
            creator: item.creator
          });
        });
        this.tempList.sort((a, b) => {
          if (a.parentId > b.parentId) {
            return 1;
          } else if (a.parentId === b.parentId) {
            // 按照时间排序
            if(a.createTime > b.createTime) {
              return 1;
            } else if(a.createTime === b.createTime) {
              return 0;
            } else {
              return -1;
            }
          } else {
            return -1;
          }
        });
        // console.log(this.folderList);
        this.calcFolderList();
        if (this.folderList.length) {
          let folderId = this.folderList[0].id;
          if (this.$route.query.folderId) {
            folderId = +this.$route.query.folderId;
          }
          this.getFileList(folderId);
        }
      });
    },
    getFileList(parentId = this.parentId, page = this.page) {
      this.showMenu = false;
      this.parentId = parentId;
      this.$router.replace({ path: '/main', query: { folderId: parentId } });
      // this.$route.query.folderId = parentId;
      // console.log(this.$route);
      const loc = window.location;
      const prefix = loc.protocol + '//' + loc.host;
      const params = {
        pageSize: page.pageSize,
        pageNo: page.pageNo,
        parentId,
        downloadPrefix: prefix,
      };
      this.$api.getFileList(params).then((res) => {
        const { data } = res;
        if (data) {
          this.tableData = data.list;
          this.page.totalRecords = data.page.totalRecords;
          this.page.pageNo = data.page.pageNo;
          this.page.pageSize = data.page.pageSize;
        }
      });
    },
    calcFolderList() {
      // 整合文件夹列表，组合父子关系
      const list = [];
      const length = this.tempList.length;
      for (let i = 0; i < length; i++) {
        const folder = this.tempList.shift();
        this.isAdd = false;
        if (list.length === 0) {
          list.push(folder);
        } else {
          this.calcSubFolderList(list, folder);
          if(this.isAdd === false) {
            list.push(folder);
          }
        }
      }
      this.folderList = list;
    },
    calcSubFolderList(list, folder) {
      // 父子节点添加
      list.forEach((item) => {
        if(item.id === folder.parentId) {
          item.subMenu.push(folder);
          this.isAdd = true;
        } else if (item.subMenu.length > 0) {
          this.calcSubFolderList(item.subMenu, folder);
          // console.log(this.isAdd, folder.name);
        }
      });
    },
    uploadSuccess() {
      // console.log('hello upload');
      this.getFileList(this.parentId);
    },
    downloadFile(row) {
      // this.$api.download({ id: row.id }).then((res) => {
      //   // this.$message.success('删除成功');
      //   // this.getFileList(0);
      // });
      // window.open('http://localhost:3000/download/' + row.fileName);
      window.open(row.url);
      // axios.get('http://localhost:3000/download/' + row.fileName).then((res) => {
      //   console.log(res);
      // });
    },
    delFile(row) {
      this.$confirm('确认删除该文件？', '提示').then((val) => {
        this.$api.delFileAndFolder({ id: row.id }).then((res) => {
          this.$message.success('删除成功');
          this.getFileList();
        });
      }).catch((e) => {
        // console.log(e);
      });
    },
    handleCurrentChange(...args) {
      this.page.pageNo = args[0];
      this.getFileList();
    },
    handleSelectionChange(val) {
      this.selectedList = val;
    },
    handleRemoveAttachment(file) {
      this.selectedList.splice(this.selectedList.indexOf(file), 1);
      this.$refs.fileListTable.toggleRowSelection(file);
    },
    editEmail() {
      this.showEmailDialog = true;
      this.$nextTick(() => {
        this.$refs.emailForm.resetFields();
      });
    },
    sendEmail() {
      this.$refs.emailForm.validate((value) => {
        if (value) {
          const params = Object.assign({}, this.emailForm);
          Object.keys(params).forEach((key) => {
            params[key] = params[key].trim();
          });
          params.attachments = this.selectedList;
          let countSize = 0;
          params.attachments.forEach((file) => {
            countSize = countSize + (+file.size);
          });
          // console.log(countSize);
          if (countSize > (1024 * 1024 * 30)) {
            this.$message.warning('附件不能大于30M');
            return;
          }
          this.$api.sendMail(params).then((res) => {
            this.showEmailDialog = false;
            if (res.status === 1) {
              this.$message.success('发送成功');
            } else {
              this.$message.error('发送失败');
            }
          });
        }
      });
    },
    showImage(row) {
      if (row && row.url) {
        const reg = /^https?:\/\/[\w-.]+(:\d+)?/i;
        const origin = reg.exec(row.url)[0];
        this.imgUrl = `${origin}/files/${row.path}-${row.fileName}`;
        this.showImageDialog = true;
      }
    },
    // 绘制底部背景
    bottomBg() {
      const canvas = this.$refs.canvas;
      canvas.width = document.body.clientWidth;
      // canvas.height = document.body.clientHeight;
      canvas.height = 200;
      const cxt = canvas.getContext('2d');
      let circleList = [];

      function randomCircleOption() {
        const r = random(2, 10);
        const x = random(0, canvas.width);
        const y = canvas.height;
        return circleList.push({
          red: random(0, 255),
          green: random(0, 255),
          blue: random(0, 255),
          x: x,
          y: y,
          r: r,
          opacity: 0,
          show: false,
          scale: 0
        });
      }

      function drawCircle() {
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        const circleListTemp = circleList;
        circleList = [];
        circleListTemp.forEach(circle => {
          const color = 'rgba(' + circle.red + ', ' + circle.green + ', ' + circle.blue + ', ' + circle.opacity + ')';
          cxt.fillStyle= color;
          cxt.strokeStyle= color;
          cxt.beginPath();
          cxt.arc(circle.x, circle.y, circle.r * circle.scale, 0, Math.PI*2, true);
          cxt.closePath();
          cxt.stroke();
          const scaleStep = 5;
          const opacityStep = 5;
          if (circle.show === false) {
            circle.opacity = (circle.opacity * 100 + opacityStep) / 100;
            if (circle.opacity >= 1) {
              circle.show = true;
            }
            circleList.push(circle);
          } else if (circle.opacity > 0) {
            circle.opacity = (circle.opacity * 100 - opacityStep) / 100;
            circleList.push(circle);
          }
          if (circle.scale < 1.5) {
            circle.scale = (circle.scale * 100 + scaleStep) / 100;
          }
          circle.y = circle.y - 1;
        });
      }

      const s = setInterval(() => {
        randomCircleOption();
        drawCircle();
        if (circleList.length > 100) {
          clearTimeout(s);
        }
      }, 50);

      function random(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
      }
    },
    // 调整菜单宽度
    resizeMenuWidth() {
      const line = this.$refs.resizeLine;
      //
    },
    resizeMenuStart(e) {
      e.preventDefault();
      const el = e.target || e.srcElement;
      if (el.id === 'resize_line') {
        this.resizeMenu = true;
        this.resizeMenuX = e.clientX;
        const menu = this.$refs.menu;
        this.resizeMenuInitWidth = 300;
        // console.log(menu);
        // console.log(menu.style.width);
        if (menu.style.width) {
          this.resizeMenuInitWidth = +menu.style.width.replace('px', '');
        }
      }
      // console.log(e);
      // console.log('start');
    },
    resizeMenuMove(e) {
      e.preventDefault();
      if (this.resizeMenu) {
        // const el = e.target || e.srcElement;
        const menu = this.$refs.menu;
        // console.log('startX-->' + this.resizeMenuX);
        // console.log('move-->' + e.clientX);
        // console.log('delta-->' + (e.clientX - this.resizeMenuX));
        const width = this.resizeMenuInitWidth + (e.clientX - this.resizeMenuX);
        // console.log('resizeMenuInitWidth-->' + this.resizeMenuInitWidth);
        // console.log('width-->' + width);
        if (width > 30 && width < 500) {
          menu.style.width = width + 'px';
        }
        // console.log(e);
        // console.log('move');
      }
    },
    resizeMenuEnd(e) {
      e.preventDefault();
      // console.log(e);
      // console.log('end');
      this.resizeMenu = false;
    },
    // 监听切换菜单
    listenMenu() {
      EventBus.$off('toggleMenu', this.toggleMenu);
      EventBus.$on('toggleMenu', this.toggleMenu);
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
  },
  mounted() {
    this.bottomBg();
    this.resizeMenuWidth();
  },
  filters: {
    formatTime(date, block) {
      if (!date) {
        return '';
      }

      let format = block || 'yyyy-MM-dd';

      if (typeof date === 'string' && /^\d+$/.test(date)) {
        date = +date;
      }

      date = new Date(date);

      const map = {
        M: date.getMonth() + 1, // 月份
        d: date.getDate(), // 日
        h: date.getHours(), // 小时
        m: date.getMinutes(), // 分
        s: date.getSeconds(), // 秒
        q: Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds() // 毫秒
      };

      format = format.replace(/([yMdhmsqS])+/g, (all, t) => {
        let v = map[t];
        if (v !== undefined) {
          if (all.length > 1) {
            v = `0${v}`;
            v = v.substr(v.length - 2);
          }
          return v;
        } else if (t === 'y') {
          return (date.getFullYear().toString()).substr(4 - all.length);
        }
        return all;
      });

      return format;
    },
    calcFileSize(size) {
      if (isNaN(size)) {
        return size;
      }
      if (String(size).length > 6) {
        return (size / 1024 / 1024).toFixed(2) + 'M';
      } else if (String(size).length > 3) {
        return (size / 1024).toFixed(2) + 'K';
      }
      return size + 'B';
    }
  },
  created() {
    if (this.$route.query.folderId) {
      this.parentId = +this.$route.query.folderId;
    }
    this.getFolderList();
    this.listenMenu();
  }
};
