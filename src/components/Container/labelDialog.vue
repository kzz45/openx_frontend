<template>
  <div>
    <el-dialog :title="dialog_title" :visible.sync="label_dialog" width="50%">
      <!-- :model="label_form" -->
      <el-form ref="label_form_refs" size="small" label-width="80px">
        <el-row v-for="(item, index) in label_value_list" :key="index">
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
                @confirm="delete_item(item)"
                @cancel="cancel_delete"
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
              <!-- <el-button
                style="margin-left: 10px"
                :type="item.isAdd ? 'primary' : 'danger'"
                :icon="
                  item.isAdd
                    ? 'el-icon-circle-plus-outline'
                    : 'el-icon-remove-outline'
                "
                @click="dynamic_kv(item)"
              ></el-button> -->
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancel" type="info">取 消</el-button>
        <el-button type="primary" size="small" @click="submit">确 定</el-button>
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
    // label_form: {
    //   type: Object,
    //   default: {},
    // },
    label_value_list: {
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
    cancel() {
      this.$emit("cancel");
    },
    submit() {
      this.$emit("submit");
    },
    del(item) {
      this.$emit("del", item);
    },
    add() {
      this.$emit("add");
    },
    dynamic_kv(item) {
      this.$emit("dynamic_kv", item);
    },
    delete_item(item) {
      this.$emit("delete_item", item);
    },
    cancel_delete() {
      this.$emit("cancel_delete");
    },
  },
};
</script>
