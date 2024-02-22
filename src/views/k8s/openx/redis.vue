<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_redis"
        >新增</el-button
      >

      <el-table
        :data="redis_list"
        size="mini"
        empty-text="啥也没有"
        border
      ></el-table>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="redis_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="redis_obj_refs"
          :model="redis_obj"
          size="small"
          label-width="80px"
        >
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="redis_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_redis"
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
        create_redis: "新增",
        update_redis: "编辑",
      },
      redis_dialog: false,
      dialogStatus: "",
      redis_list: [],
      redis_obj: {},
    };
  },
  methods: {
    create_redis() {
      this.redis_dialog = true;
      this.dialogStatus = "create_redis";
    },
    update_redis() {
      this.redis_dialog = true;
      this.dialogStatus = "create_redis";
    },
    delete_redis() {},
    get_redis_list() {},
    submit_redis() {},
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
