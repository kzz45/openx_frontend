<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_mysql"
        >新增</el-button
      >

      <el-table
        :data="mysql_list"
        size="mini"
        empty-text="啥也没有"
        border
      ></el-table>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="mysql_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="mysql_obj_refs"
          :model="mysql_obj"
          size="small"
          label-width="80px"
        >
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="mysql_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_mysql"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      textMap: {
        create_mysql: "新增",
        update_mysql: "编辑",
      },
      mysql_dialog: false,
      dialogStatus: "",
      mysql_list: [],
      mysql_obj: {},
    };
  },
  methods: {
    create_mysql() {
      this.mysql_dialog = true;
      this.dialogStatus = "create_mysql";
    },
    update_mysql() {
      this.mysql_dialog = true;
      this.dialogStatus = "create_mysql";
    },
    delete_mysql() {},
    get_mysql_list() {},
    submit_mysql() {},
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
