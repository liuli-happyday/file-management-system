<template>
    <div ref="main" class="main" @mousedown="resizeMenuStart" @mousemove="resizeMenuMove" @mouseup="resizeMenuEnd">
      <div ref="menu" class="left_menu" :class="{show: showMenu}">
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
        <fold-list :active-id="parentId" :fold-data="folderList" @updateFolderList="getFolderList" @getFolderFiles="getFileList"/>
        <div id="resize_line" class="move_menu"></div>
      </div>
      <!--<el-scrollbar ref="menu" wrap-class="left_menu" wrap-style="width: 300px;">-->
        <!--<fold-list :active-id="parentId" :fold-data="folderList" @updateFolderList="getFolderList" @getFolderFiles="getFileList"></fold-list>-->
        <!--<div id="resize_line" class="move_menu"></div>-->
      <!--</el-scrollbar>-->
      <div class="file_list" @click="showMenu=false">
        <div class="fold_operation">
          <el-button type="primary" @click="editEmail">邮件提醒</el-button>
          <el-button type="primary" @click="showUpload = true">上传文件</el-button>
        </div>
        <!--action="https://jsonplaceholder.typicode.com/posts/"-->
        <!--<upload-file class="fold_operation" :parent-id="parentId" @uploadSuccess="uploadSuccess"></upload-file>-->

        <div class="file_list_table">
          <el-table ref="fileListTable" :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" label="选择邮件附件"></el-table-column>
            <el-table-column prop="fileName" label="文件名称" min-width="180">
              <template slot-scope="scope">
                <i class="iconfont" :class="scope.row.icon"></i> {{ scope.row.fileName }}
              </template>
            </el-table-column>
            <el-table-column prop="size" label="文件大小" width="180">
              <template slot-scope="scope">{{ scope.row.size | calcFileSize }}</template>
            </el-table-column>
            <el-table-column prop="creator" label="上传者" width="180"></el-table-column>
            <el-table-column prop="updateTime" label="上传时间" width="180">
              <template slot-scope="scope">{{ scope.row.createTime | formatTime('yyyy-MM-dd hh:mm:ss') }}</template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template slot-scope="scope">
                <el-button type="text" @click="downloadFile(scope.row)">下载</el-button>
                <el-button v-if="username === scope.row.creator" type="text" @click="delFile(scope.row)">删除</el-button>
                <el-button v-if="scope.row.icon === 'icon-image'" type="text" @click="showImage(scope.row)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pagination" v-show="page.totalRecords">
          <el-pagination @current-change="handleCurrentChange" :current-page="page.currentPage" :page-size="page.pageSize" layout="total, prev, pager, next, jumper" :total="page.totalRecords">
          </el-pagination>
        </div>
      </div>

      <el-dialog :visible.sync="showUpload" title="文件上传">
        <upload-file class="upload_component" :parent-id="parentId" @uploadSuccess="uploadSuccess"></upload-file>
      </el-dialog>
      <!--邮件提醒弹框start-->
      <el-dialog :visible.sync="showEmailDialog" title="发送邮件提醒">
        <el-form ref="emailForm" :model="emailForm" :rules="emailFormRules">
          <el-row>
            <el-col :span="12" style="padding-right: 10px;">
              <el-form-item label="From" prop="sender">
                <el-input v-model="emailForm.sender" type="text" placeholder="发件人"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12" style="padding-left: 10px;">
              <el-form-item label="Subject" prop="subject">
                <el-input v-model="emailForm.subject" type="text" placeholder="邮件主题"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="To (多个收件人以英文逗号隔开，默认为pinjamango邮箱，其他邮箱请全拼)" prop="to">
            <el-input v-model="emailForm.to" type="text" placeholder="收件人（ex: liuli, liuli@minivision.cn）"></el-input>
          </el-form-item>
          <el-form-item label="CC" prop="cc">
            <el-input v-model="emailForm.cc" type="text" placeholder="CC（ex: liuli, liuli@minivision.cn）"></el-input>
          </el-form-item>
          <el-form-item label="Content" prop="text">
            <el-input v-model="emailForm.text" type="text" placeholder="邮件内容"></el-input>
          </el-form-item>
          <el-form-item label="附件(不能大于30M)：">
            <el-tag v-for="file in selectedList" :key="file.id" closable @close="handleRemoveAttachment(file)">{{file.fileName}}</el-tag>
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button type="primary" @click="sendEmail">发送</el-button>
          <el-button type="default" @click="showEmailDialog = false">取消</el-button>
        </div>
      </el-dialog>
      <!--邮件提醒弹框end-->
      <show-image-video :visible.sync="showImageDialog" :img-src="imgUrl">图片展示</show-image-video>
      <canvas ref="canvas" id="canvas"></canvas>
    </div>
</template>

<script src="./main.js"></script>

<style lang="scss" scoped>
  @import "index";
</style>
