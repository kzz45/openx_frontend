<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs>
        <el-tab-pane label="Openx">
          <el-button type="primary" size="small" icon="el-icon-plus"
            >新增</el-button
          >
          <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入YAML</el-button
          >
          <el-button type="info" size="small" icon="el-icon-copy-document"
            >拷贝</el-button
          >
          <el-button type="warning" size="small" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button type="danger" size="small" icon="el-icon-delete"
            >删除</el-button
          > -->
          <el-table :data="autoset_list" size="small" empty-text="啥也没有" border>
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="名称"></el-table-column>
            <el-table-column label="更新时间"></el-table-column>
            <el-table-column label="操作"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- <el-tab-pane label="MySQL"></el-tab-pane> -->
        <!-- <el-tab-pane label="Redis"></el-tab-pane> -->
        <!-- <el-tab-pane label="Etcd"></el-tab-pane> -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SelfBuildApp",
  data() {
    return {
      autoset_list: [],
    };
  },
};
</script>

<style scoped>
.el-input {
  width: 200px;
}

.el-select {
  width: 200px;
}

.el-table {
  width: 100%;
  margin-top: 10px;
}

.el-button {
  vertical-align: top;
}
</style>
