<template>
  <div>
    <el-dialog title="新增kv" :visible.sync="label_dialog" width="50%">
      <el-form size="small" label-width="80px">
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
              <el-button
                style="margin-left: 10px"
                :type="item.isAdd ? 'primary' : 'danger'"
                :icon="
                  item.isAdd
                    ? 'el-icon-circle-plus-outline'
                    : 'el-icon-remove-outline'
                "
                @click="add_kv(item)"
              ></el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="cancel_create_kv" type="info"
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
  name: "GlobalLabel",
  props: {
    label_value_list: {
      type: Array,
      required: true,
      default: [{ isAdd: true, key: "", value: "" }],
    },
    label_dialog: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  methods: {
    add_kv() {},
    cancel_create_kv() {},
    submit_kv() {},
  },
};
</script>
