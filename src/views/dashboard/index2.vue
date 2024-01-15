<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button @click="create_app">新增</el-button>
      <el-button @click="test_dialog">测试Dialog</el-button>
      <el-button @click="addTab">测试标签</el-button>
      <el-divider content-position="right">分割线</el-divider>
      <el-tag
        v-for="(tag, tagIndex) in dynamicTags"
        :key="tagIndex"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)"
        @click="tag_click(tag)"
        type="success"
      >
        {{ tag.name }}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput"
        >+ New Tag</el-button
      >

      <el-divider content-position="right">分割线</el-divider>
      <el-input
        v-if="active_tag"
        v-model="active_tag"
        @change="change_tag_name(active_tag)"
      ></el-input>

      <!-- <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        text-color="#fff"
        active-text-color="#ffd04b"
        background-color="#545c64"
      >
        <el-menu-item index="1">xxx</el-menu-item>
        <el-menu-item index="2">yyy</el-menu-item>
      </el-menu> -->

      <LabelDialog
        :visible.sync="test_label_dialog"
        title="标签"
        :label_form="save_label_form"
        :label_value_list="label_value_list"
        @cancel="test_dialog_cancel"
        @submit="test_dialog_save"
        @del="test_dialog_del"
        @add="test_dialog_add"
        @dynamic_kv="dynamic_kv"
        @delete_item="delete_item"
        @cancel_delete="cancel_delete"
      ></LabelDialog>
    </el-card>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="app_dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="5%"
      width="60%"
    >
      <el-tabs tab-position="top">
        <el-tab-pane label="基本信息">
          <Metadata></Metadata>
        </el-tab-pane>
        <el-tab-pane label="容器信息">
          <Container></Container>
        </el-tab-pane>
        <el-tab-pane label="服务信息">
          <Service></Service>
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="app_dialog = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit_app"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Container from "@/components/Container/container";
import Metadata from "@/components/Container/metadata";
import Service from "@/components/Container/service";
import LabelDialog from "@/components/Container/labelDialog";

export default {
  name: "Dashboard",
  computed: {},
  components: {
    Container,
    Metadata,
    Service,
    LabelDialog,
  },
  data() {
    return {
      textMap: {
        create_app: "新增",
        update_app: "编辑",
      },
      dialogStatus: "",
      app_dialog: false,
      label_dialog: false,
      label_form: {},
      label_value_list: [{ isAdd: true, key: "", value: "" }],
      app_form: {},
      app_form_rules: {},
      tab_pane_list: [],
      tab_index: 0,
      test_label_dialog: false,
      save_label_form: {
        key: "",
        value: "",
      },
      container_form: {},
      container_form_name: "",
      dynamicTags: [],
      active_tag: "",
      inputVisible: false,
      inputValue: "",
      activeIndex: "1",
    };
  },
  methods: {
    create_app() {
      this.app_dialog = true;
      this.dialogStatus = "create_app";
    },
    submit_app() {},
    addTab() {},
    test_dialog() {
      this.label_value_list = [{ isAdd: true, key: "", value: "" }];
      this.test_label_dialog = true;
    },
    test_dialog_cancel() {
      this.test_label_dialog = false;
    },
    test_dialog_save() {
      console.log("====", this.label_value_list);
      this.test_label_dialog = false;
    },
    test_dialog_del(item) {
      console.log(item);
    },
    test_dialog_add() {},
    dynamic_kv(row) {
      if (row.isAdd) {
        this.label_value_list.slice(-1)[0].isAdd = false;
        this.label_value_list.push({
          isAdd: true,
          key: "",
          value: "",
        });
      } else {
        this.label_value_list = this.label_value_list.filter(
          (item) => item !== row
        );
      }
    },
    delete_item(row) {
      this.label_value_list = this.label_value_list.filter(
        (item) => item !== row
      );
    },
    cancel_delete() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    handleClose() {},
    tag_click(tag) {
      console.log("=====", tag);
      this.active_tag = tag;
    },
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.indexOf(inputValue) === -1
          ? this.dynamicTags.push({
              name: inputValue,
            })
          : this.$message({ type: "warning", message: "名称冲突" });
      }
      this.active_tag = inputValue;
      this.inputVisible = false;
      this.inputValue = "";
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    change_tag_name(e) {
      // console.log("====", e);
    },
    handleSelect() {},
  },
};
</script>

<style scoped>
.el-input {
  width: 300px;
}

.el-select {
  width: 300px;
}

.el-table {
  width: 100%;
  margin-top: 10px;
}

.el-button {
  vertical-align: top;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
