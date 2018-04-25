<template>
    <div class="main">
      <div class="left_menu">
        <!--<ul class="fold_list">
          <li class="fold">
            <a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>
            <a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>
            <a href="javascript:void(0);" class="fold_operation add_sub_fold el-icon-plus"></a>
            <a href="javascript:void(0);" class="fold_operation del_fold el-icon-minus"></a>
            <ul class="sub_fold_list">
              <li class="fold">
                <a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>
                <a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>
                <ul class="sub_fold_list">
                  <li class="fold">
                    <a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>
                    <a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>-->
        <fold-list :active-id="parentId" :fold-data="folderList" @updateFolderList="getFolderList" @getFolderFiles="getFileList"></fold-list>
      </div>
      <div class="file_list">
        <div class="fold_operation">
          <el-button type="primary" @click="showUpload = true">上传文件</el-button>
        </div>
        <!--action="https://jsonplaceholder.typicode.com/posts/"-->
        <!--<upload-file class="fold_operation" :parent-id="parentId" @uploadSuccess="uploadSuccess"></upload-file>-->

        <div class="file_list_table">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="fileName" label="文件名称" min-width="180">
              <template slot-scope="scope">
                <i class="iconfont" :class="scope.row.icon"></i> {{ scope.row.fileName }}
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="上传时间" width="180">
              <template slot-scope="scope">{{ scope.row.updateTime | formatTime('yyyy-MM-dd hh:mm:ss') }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button type="text" @click="downloadFile(scope.row)">下载</el-button>
                <el-button type="text" @click="delFile(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <el-dialog :visible.sync="showUpload" title="文件上传">
        <upload-file class="upload_component" :parent-id="parentId" @uploadSuccess="uploadSuccess"></upload-file>
      </el-dialog>
    </div>
</template>

<script>
  import foldList from './fold-list';
  // import UploadFile from '../../components/upload-file';
  import UploadFile from '../../components/drag-upload';
  import axios from 'axios';

  export default {
    name: 'filesList',
    components: {
      foldList,
      UploadFile
    },
    data() {
        return {
          tableData: [],
          folderList: [],
          tempList: [],
          parentId: 0,
          isAdd: false,
          showUpload: false
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
              parentId: item.parentId
            });
          });
          this.tempList.sort((a, b) => {
            if (a.parentId > b.parentId) {
              return 1;
            } else if (a.parentId === b.parentId) {
              return 0;
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
      getFileList(parentId = this.parentId) {
        this.parentId = parentId;
        this.$router.replace({ path: '/main', query: { folderId: parentId } });
        // this.$route.query.folderId = parentId;
        // console.log(this.$route);
        const params = {
          pageSize: 12,
          pageNo: 1,
          parentId
        };
        this.$api.getFileList(params).then((res) => {
          if (res.data) {
            this.tableData = res.data;
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
          } else if (item.subMenu.length > 1) {
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
      }
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
      }
    },
    created() {
      if (this.$route.query.folderId) {
        this.parentId = +this.$route.query.folderId;
      }
      this.getFolderList();
    }
  };
</script>

<style lang="scss" scoped>
  @import "index";
</style>
