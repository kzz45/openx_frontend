<template>
  <div>
    <el-form
      ref="metadata_form_refs"
      :model="metadata_form"
      size="small"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="metadata_form.name"
              placeholder="请输入名称"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="命名空间" prop="namespace">
            <el-input
              v-model="metadata_form.namespace"
              placeholder=""
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="注解" prop="annotations">
            <el-button
              size="small"
              icon="el-icon-plus"
              @click="add_annotation"
            ></el-button>
            <el-tooltip placement="right" effect="light">
              <div
                slot="content"
                v-for="(item, index) in annotations_list"
                :key="index"
              >
                <el-tag size="mini" type="info">{{ item.key }}</el-tag>
                <el-tag size="mini" type="success">{{ item.value }}</el-tag>
                <br />
              </div>
              <el-button
                type="info"
                icon="el-icon-collection-tag"
                size="small"
              ></el-button>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签" prop="labels">
            <el-button
              size="small"
              icon="el-icon-plus"
              @click="add_label"
            ></el-button>
            <el-tooltip placement="right" effect="light">
              <div
                slot="content"
                v-for="(item, index) in labels_list"
                :key="index"
              >
                <el-tag size="mini" type="info">{{ item.key }}</el-tag>
                <el-tag size="mini" type="success">{{ item.value }}</el-tag>
                <br />
              </div>
              <el-button
                type="info"
                icon="el-icon-collection-tag"
                size="small"
              ></el-button>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <LabelDialog
      :title="annotation_title"
      :visible="annotation_visible"
      :key_value_list="annotation_key_value_list"
      @delete_kv="annotation_delete_kv"
      @cancel_delete_kv="annotation_cancel_delete_kv"
      @dynamic_kv="annotation_dynamic_kv"
      @cancel_submit_kv="annotation_cancel_submit_kv"
      @submit_kv="annotation_submit_kv"
    ></LabelDialog>

    <LabelDialog
      :title="label_title"
      :visible="label_visible"
      :key_value_list="label_key_value_list"
      @delete_kv="label_delete_kv"
      @cancel_delete_kv="label_cancel_delete_kv"
      @dynamic_kv="label_dynamic_kv"
      @cancel_submit_kv="label_cancel_submit_kv"
      @submit_kv="label_submit_kv"
    ></LabelDialog>
  </div>
</template>

<script>
import LabelDialog from "./labelDialog";

export default {
  components: {
    LabelDialog,
  },
  props: {
    metadata_form: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  watch: {
    metadata_form: {
      handler(newVal) {
        let metadata_obj = Object.assign({}, newVal);
        // console.log("===", metadata_obj);
        this.labels_list = [];
        for (const [key, value] of Object.entries(metadata_obj.labels)) {
          this.labels_list.push({
            key: key,
            value: value,
          });
        }
        this.annotations_list = [];
        for (const [key, value] of Object.entries(metadata_obj.annotations)) {
          this.annotations_list.push({
            key: key,
            value: value,
          });
        }
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      metadata_obj: {
        name: "",
        namespace: "",
        annotations: {},
        labels: {},
        creationTimestamp: {
          seconds: 0,
        },
      },
      annotations_list: [],
      annotation_title: "新增注解",
      annotation_visible: false,
      annotation_key_value_list: [{ isAdd: true, key: "", value: "" }],
      labels_list: [],
      label_title: "新增标签",
      label_visible: false,
      label_key_value_list: [{ isAdd: true, key: "", value: "" }],
    };
  },
  methods: {
    add_annotation() {
      this.annotation_visible = true;
      this.annotation_key_value_list = [{ isAdd: true, key: "", value: "" }];
    },
    annotation_delete_kv(row) {
      this.annotation_key_value_list = this.annotation_key_value_list.filter(
        (item) => item !== row
      );
    },
    annotation_cancel_delete_kv() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    annotation_dynamic_kv(row) {
      if (row.isAdd) {
        this.annotation_key_value_list.slice(-1)[0].isAdd = false;
        this.annotation_key_value_list.push({
          isAdd: true,
          key: "",
          value: "",
        });
      } else {
        this.annotation_key_value_list = this.annotation_key_value_list.filter(
          (item) => item !== row
        );
      }
    },
    annotation_cancel_submit_kv() {
      this.annotation_visible = false;
    },
    annotation_submit_kv() {
      this.annotation_visible = false;
      this.annotations_list = this.annotations_list.concat(
        this.annotation_key_value_list
      );
    },
    add_label() {
      this.label_visible = true;
      this.label_key_value_list = [{ isAdd: true, key: "", value: "" }];
    },
    label_delete_kv(row) {
      this.label_key_value_list = this.label_key_value_list.filter(
        (item) => item !== row
      );
    },
    label_cancel_delete_kv() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    label_dynamic_kv(row) {
      if (row.isAdd) {
        this.label_key_value_list.slice(-1)[0].isAdd = false;
        this.label_key_value_list.push({
          isAdd: true,
          key: "",
          value: "",
        });
      } else {
        this.label_key_value_list = this.label_key_value_list.filter(
          (item) => item !== row
        );
      }
    },
    label_cancel_submit_kv() {
      this.label_visible = false;
    },
    label_submit_kv() {
      this.label_visible = false;
      this.labels_list = this.labels_list.concat(this.label_key_value_list);
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

.el-button {
  vertical-align: top;
}
</style>
