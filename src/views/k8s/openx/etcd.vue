<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_etcd"
        >新增</el-button
      >

      <el-table
        :data="etcd_list"
        size="mini"
        empty-text="啥也没有"
        border
      ></el-table>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="etcd_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="etcd_obj_refs"
          :model="etcd_obj"
          size="small"
          label-width="80px"
        >
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="etcd_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_etcd"
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
        create_etcd: "新增",
        update_etcd: "编辑",
      },
      etcd_dialog: false,
      dialogStatus: "",
      etcd_list: [],
      etcd_obj: {},
    };
  },
  methods: {
    create_etcd() {
      this.etcd_dialog = true;
      this.dialogStatus = "create_etcd";
    },
    update_etcd() {
      this.etcd_dialog = true;
      this.dialogStatus = "create_etcd";
    },
    delete_etcd() {},
    get_etcd_list() {},
    submit_etcd() {},
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
