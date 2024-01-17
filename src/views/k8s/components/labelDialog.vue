<template>
  <div>
    <el-dialog
      :title="dialog_title"
      :visible.sync="label_dialog"
      width="50%"
      append-to-body
    >
      <el-form ref="label_form_refs" size="small" label-width="80px">
        <el-row v-for="(item, index) in key_value_list" :key="index">
          <el-col :span="12">
            <el-form-item label="键">
              <el-input
                v-model="item.key"
                placeholder=""
                style="width: 200px"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="值">
              <el-input
                v-model="item.value"
                placeholder=""
                style="width: 190px"
              ></el-input>
              <el-popconfirm
                v-if="!item.isAdd"
                title="确定删除吗？"
                confirm-button-text="确定"
                cancel-button-text="不了"
                style="margin-left: 10px"
                @confirm="delete_kv(item)"
                @cancel="cancel_delete_kv"
              >
                <el-button
                  type="danger"
                  slot="reference"
                  icon="el-icon-remove-outline"
                ></el-button>
              </el-popconfirm>
              <el-button
                v-if="item.isAdd"
                type="primary"
                icon="el-icon-circle-plus-outline"
                style="margin-left: 10px"
                @click="dynamic_kv(item)"
              ></el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancel_submit_kv" type="info"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="submit_kv"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    key_value_list: {
      type: Array,
      default: [{ isAdd: true, key: "", value: "" }],
    },
  },
  data() {
    return {
      dialog_title: this.title,
      label_dialog: this.visible,
    };
  },
  watch: {
    visible(val) {
      this.label_dialog = val;
    },
  },
  methods: {
    delete_kv(item) {
      this.$emit("delete_kv", item);
    },
    cancel_delete_kv() {
      this.$emit("cancel_delete_kv");
    },
    dynamic_kv(item) {
      this.$emit("dynamic_kv", item);
    },
    cancel_submit_kv() {
      this.$emit("cancel_submit_kv");
    },
    submit_kv() {
      this.$emit("submit_kv");
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
