<template>
  <div>
    <el-form
      ref="metadata_refs"
      :model="metadata"
      size="small"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="Name">
            <el-input v-model="metadata.name"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Namespace">
            <el-input v-model="metadata.namespace"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Annotations">
            <el-button
              size="small"
              icon="el-icon-plus"
              @click="add_annotations"
            ></el-button>
            <el-tag
              v-for="tag in metadata.annotations"
              :key="tag.label"
              closable
              @close="close_annotation(tag)"
              >{{ tag.label }}:{{ tag.value }}</el-tag
            >
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Labels">
            <el-button
              size="small"
              icon="el-icon-plus"
              @click="add_labels"
            ></el-button>
            <el-tag
              v-for="tag in metadata.labels"
              :key="tag.label"
              @close="close_label(tag)"
              closable
              >{{ tag.label }}:{{ tag.value }}</el-tag
            >
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="kv_dialog"
      append-to-body
    >
      <el-form size="small">
        <el-row>
          <el-col :span="12">
            <el-form-item label="label">
              <el-input v-model="kv_tag.label"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="value">
              <el-input v-model="kv_tag.value"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="kv_dialog = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit_kv"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  filters: {},
  data() {
    return {
      textMap: {
        create_annotation: "新增注解",
        update_annotation: "编辑注解",
        create_label: "新增标签",
        update_label: "编辑标签",
      },
      dialogStatus: "",
      kv_dialog: false,
      kv_tag: {
        label: "",
        value: "",
      },
      metadata: {
        name: "",
        namespace: localStorage.getItem("k8s_namespace") || "",
        labels: [],
        annotations: [],
      },
    };
  },
  methods: {
    close_annotation(tag) {
      this.metadata.annotations = this.metadata.annotations.filter(
        (item) => item !== tag
      );
    },
    close_label(tag) {
      this.metadata.labels = this.metadata.labels.filter(
        (item) => item !== tag
      );
    },
    add_annotations() {
      this.kv_dialog = true;
      this.dialogStatus = "create_annotation";
    },
    add_labels() {
      this.kv_dialog = true;
      this.dialogStatus = "create_label";
    },
    submit_kv() {
      if (this.dialogStatus === "create_annotation") {
        this.metadata.annotations.push({
          label: this.kv_tag.label,
          value: this.kv_tag.value,
        });
        this.kv_dialog = false;
      } else if (this.dialogStatus === "create_label") {
        this.metadata.labels.push({
          label: this.kv_tag.label,
          value: this.kv_tag.value,
        });
        this.kv_dialog = false;
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
