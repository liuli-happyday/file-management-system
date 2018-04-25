<!--<template>-->
    <!--<div class="fold_list">hello fold</div>-->
<!--</template>-->
<!--<ul class="fold_list">-->
  <!--<li class="fold">-->
    <!--<a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>-->
    <!--<a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>-->
    <!--<ul class="sub_fold_list">-->
      <!--<li class="fold">-->
        <!--<a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>-->
        <!--<a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>-->
        <!--<ul class="sub_fold_list">-->
          <!--<li class="fold">-->
            <!--<a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-right"></i></a>-->
            <!--<a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>-->
          <!--</li>-->
        <!--</ul>-->
      <!--</li>-->
    <!--</ul>-->
  <!--</li>-->
<!--</ul>-->

<script>
  export default {
    name: 'foldList',
    props: {
      foldData: {
        type: Array,
        default() {
          return [];
        }
      },
      activeId: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        show: true,
        foldList: []
      };
    },
    watch: {
      foldData(val) {
        this.foldList = [];
        this.filterFoldData(this.foldList, val);
        this.clearActive(this.foldList);
      },
      activeId(val) {
        this.clearActive(this.foldList);
      }
    },
    methods: {
      collapseFold(fold) {
        fold.collapse = !fold.collapse;
      },
      openFold(fold) {
        this.clearActive(this.foldList);
        fold.active = true;
        this.$emit('getFolderFiles', fold.id);
      },
      editFolder(folder) {
        this.$prompt(`${folder.name}/`, '修改文件夹', {
          inputPlaceholder: '请输入文件夹名称',
          inputValue: folder.name,
          inputPattern: /^\S+$/,
          inputErrorMessage: '请输入文件夹名称'
        }).then((val) => {
          const name = val.value.trim();
          if (name) {
            const params = {
              id: folder.id,
              name
            };
            this.$api.editFolder(params).then((res) => {
              this.$message.success('修改成功');
              this.$emit('updateFolderList');
            });
          } else {
            this.$message.error('文件夹名称不能为空');
          }
        }).catch((e) => {
          // console.log(e);
        });
      },
      addFold(fold) {
        this.$prompt(`${fold.name}/`, '新建文件夹', {
          inputPlaceholder: '请输入文件夹名称',
          inputPattern: /^\S+$/,
          inputErrorMessage: '请输入文件夹名称'
        }).then((val) => {
          const name = val.value.trim();
          if (name) {
            const params = {
              parentId: fold.id,
              name
            };
            this.$api.createFolder(params).then((res) => {
              this.$message.success('添加成功');
              this.$emit('updateFolderList');
            });
          } else {
            this.$message.error('文件夹名称不能为空');
          }
        }).catch((e) => {
          // console.log(e);
        });
      },
      delFold(fold) {
        this.$confirm(`确认删除“${fold.name}”文件夹？`, '提示').then((val) => {
          // console.log(val);
          this.$api.delFileAndFolder({ id: fold.id }).then((res) => {
            this.$emit('updateFolderList');
          });
        }).catch((e) => {
          // console.log(e);
        });
      },
      clearActive(foldList) {
        foldList.forEach((item) => {
          item.active = item.id === this.activeId;
          if(item.subMenu && item.subMenu.length > 0) {
            this.clearActive(item.subMenu);
          }
        });
      },
      createdFoldList(h, foldList, sub) {
        const list = [];
        const me = this;
        foldList.forEach((fold) => {
          let subMenuList = [];
          // <a href="javascript:void(0);" class="fold_icon_collapse"><i class="el-icon-arrow-down"></i></a>
          let arrow = null;
          if(fold.subMenu.length > 0) {
            const arrowIcon = h('i', {
              'class': {
                'el-icon-arrow-down': fold.collapse === false,
                'el-icon-arrow-right': fold.collapse === true,
              }
            });
            arrow = h('a', {
              'class': 'fold_icon_collapse',
              attrs: {
                href: 'javascript:void(0);'
              },
              on: {
                click(e) {
                  e.stopPropagation();
                  e.preventDefault();
                  return me.collapseFold(fold);
                }
              }
            }, [arrowIcon]);
          }

          // <a href="javascript:void(0);" class="fold_name"><i class="icon iconfont icon-wenjian"></i> Pinjaman go</a>
          const menuIcon = h('i', { 'class': 'iconfont icon-fold' });
          const menu = h('a', {
            'class': {
              'fold_name': true,
              'active': fold.active
            },
            attrs: {
              href: 'javascript:void(0);'
            },
            on: {
              click(e) {
                e.stopPropagation();
                e.preventDefault();
                return me.openFold(fold);
              }
            }
          }, [menuIcon, ' ', fold.name]);

          if (fold.subMenu && fold.subMenu.length > 0) {
            // 添加子文件夹
            subMenuList = this.createdFoldList(h, fold.subMenu, true);
          }

          // <a href="javascript:void(0);" class="fold_operation edit_fold el-icon-edit"></a>
          // <a href="javascript:void(0);" class="fold_operation add_sub_fold el-icon-plus"></a>
          // <a href="javascript:void(0);" class="fold_operation del_fold el-icon-minus"></a>
          const edit = h('a', {
            'class': 'fold_operation edit_fold el-icon-edit',
            attrs: {
              href: 'javascript:void(0);'
            },
            on: {
              click(e) {
                e.stopPropagation();
                e.preventDefault();
                return me.editFolder(fold);
              }
            }
          });
          const plus = h('a', {
            'class': 'fold_operation add_sub_fold el-icon-plus',
            attrs: {
              href: 'javascript:void(0);'
            },
            on: {
              click(e) {
                e.stopPropagation();
                e.preventDefault();
                return me.addFold(fold);
              }
            }
          });
          let minus = null;
          // console.log(fold.rootFold);
          if(!fold.rootFold) {
            minus = h('a', {
              'class': 'fold_operation del_fold el-icon-minus',
              attrs: {
                href: 'javascript:void(0);'
              },
              on: {
                click(e) {
                  e.stopPropagation();
                  e.preventDefault();
                  return me.delFold(fold);
                }
              }
            });
          }

          list.push(h('li', {
            'class': {
              'fold': true,
              'folder_collapse': fold.collapse
            },
          }, [arrow, menu, edit, plus, minus, subMenuList]));
        });
        return h('ul', {
          'class': sub ?  'sub_fold_list' : 'fold_list'
        }, [list]);
      },
      filterFoldData(target, foldList) {
        foldList.forEach((item) => {
          const subMenu = [];
          if (item.subMenu instanceof Array && item.subMenu.length > 0) {
            this.filterFoldData(subMenu, item.subMenu);
          }
          target.push({
            id: item.id,
            parentId: item.parentId,
            name: item.name,
            active: item.active === true,
            subMenu,
            rootFold: item.rootFold,
            collapse: false
          });
        });
      },
      getTableData() {
        const params = {
          parentId: 0
        };
        this.$api.getFolderList(params).then((res) => {
          // console.log(res);
          this.foldList = res.data;
          res.data.forEach((item) => {
            this.foldList.push({
              name: item.name,
              rootFold: +item.root === 1,
              active: false,
              subMenu: [],
              parentId: item.parentId
            });
          });
        });
      },
      activeFolder(id, list) {
        list.forEach((item) => {
          if (item.id === id) {
            item.active = true;
          }
        })
      }
    },
    render(h) {
      // 渲染dom结构
      const list = this.createdFoldList(h, this.foldList);
      return h('div', [list]);
    },
    created() {
      this.foldList = [];
      this.filterFoldData(this.foldList, this.foldData);
      this.clearActive(this.foldList);
    }
  }
</script>

<style lang="scss" scoped>
  .fold_list{
    padding: 20px;
    .fold{
      position: relative;
      padding-left: 20px;
      &:hover > .fold_operation{
        display: block;
      }
      &.folder_collapse > .sub_fold_list{
        display: none;
      }
    }
    .fold_name{
      margin-bottom: 10px;
      &.active{
        color: #409EFF;
      }
    }
    a{
      display: block;
      font-size: 16px;
      color: #000;
    }
    .fold_icon_collapse{
      position: absolute;
      left: 0;
      top: 0;
    }
    .fold_operation{
      position: absolute;
      top: 0;
      right: 0;
      width: 20px;
      height: 20px;
      border-radius: 6px;
      text-align: center;
      line-height: 20px;
      color: #fff;
      font-size: 12px;
      display: none;
    }
    .add_sub_fold{
      right: 25px;
      color: #409EFF;
    }
    .del_fold{
      color: #F56C6C;
    }
    .edit_fold{
      right: 50px;
      color: #409EFF;
    }
  }
</style>
