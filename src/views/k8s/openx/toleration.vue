<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_toleration"
        >新增</el-button
      >
      <el-table
        :data="toleration_list"
        size="small"
        empty-text="啥也没有"
        border
      ></el-table>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="toleration_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="toleration_obj_refs"
          :model="toleration_obj"
          size="small"
          label-width="80px"
        >
          <el-form-item label="instance" prop=""></el-form-item>
          <el-form-item label="status" prop=""></el-form-item>
          <el-form-item label="type" prop=""></el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="toleration_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_toleration"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
const TolerationObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
  },
  spec: {
    affinity: {
      nodeAffinity: {
        preferredDuringSchedulingIgnoredDuringExecution: [],
        requiredDuringSchedulingIgnoredDuringExecution: {
          nodeSelectorTerms: [],
        },
      },
      podAffinity: {
        preferredDuringSchedulingIgnoredDuringExecution: [],
        requiredDuringSchedulingIgnoredDuringExecution: [],
      },
      podAntiAffinity: {
        preferredDuringSchedulingIgnoredDuringExecution: [],
        requiredDuringSchedulingIgnoredDuringExecution: [],
      },
    },
  },
};

export default {
  data() {
    return {
      textMap: {
        create_toleration: "新增",
        update_toleration: "编辑",
      },
      dialogStatus: "",
      toleration_dialog: false,
      toleration_list: [],
      toleration_obj: {},
    };
  },
  methods: {
    create_toleration() {
      this.toleration_dialog = true;
      this.dialogStatus = "create_toleration";
      this.toleration_obj = Object.assign({}, TolerationObj);
    },
    update_toleration(row) {
      this.toleration_dialog = true;
      this.dialogStatus = "create_toleration";
      this.toleration_obj = Object.assign({}, row);
    },
    delete_toleration(row) {
      this.toleration_obj = Object.assign({}, row);
    },
    submit_toleration() {
      if (this.dialogStatus === "create_toleration") {
        //
      } else if (this.dialogStatus === "update_toleration") {
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
