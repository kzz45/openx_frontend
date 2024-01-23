<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_affinity"
        >新增</el-button
      >
      <el-table
        :data="affinity_list"
        size="small"
        empty-text="啥也没有"
        border
      ></el-table>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="affinity_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="affinity_obj_refs"
          :model="affinity_obj"
          size="small"
          label-width="80px"
        >
          <el-form-item label="instance" prop=""></el-form-item>
          <el-form-item label="status" prop=""></el-form-item>
          <el-form-item label="type" prop=""></el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="affinity_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_affinity"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
const AffinityObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
  spec: {
    instance: {
      key: "",
      value: "",
    },
    overrideListeners: {
      key: "",
      value: "",
    },
  },
};

export default {
  data() {
    return {
      textMap: {
        create_affinity: "新增",
        update_affinity: "编辑",
      },
      dialogStatus: "",
      affinity_dialog: false,
      affinity_list: [],
      affinity_obj: {},
    };
  },
  methods: {
    create_affinity() {
      this.affinity_dialog = true;
      this.dialogStatus = "create_affinity";
      this.affinity_obj = Object.assign({}, AffinityObj);
    },
    update_affinity(row) {
      this.affinity_dialog = true;
      this.dialogStatus = "create_affinity";
    },
    delete_affinity(row) {},
    submit_affinity() {
      if (this.dialogStatus === "create_affinity") {
        //
      } else if (this.dialogStatus === "update_affinity") {
        //
      }
    },
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
