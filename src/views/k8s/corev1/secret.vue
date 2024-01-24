<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="creaet_secret"
        >新增</el-button
      >
      <el-table :data="secret_list" size="small" empty-text="啥也没有" border>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column
          label="命名空间"
          prop="metadata.namespace"
        ></el-table-column>
        <el-table-column label="类型" prop="type"></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scoped">
            {{
              scoped.row.metadata.creationTimestamp.seconds
                | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px;">
          <template>
            <el-button
              type="warning"
              icon="el-icon-edit"
              size="small"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="导出"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-top"
                size="small"
              ></el-button>
            </el-tooltip>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_secret(scoped.row)"
              @cancel="cancel_delete"
            >
              <el-button
                slot="reference"
                type="danger"
                icon="el-icon-delete"
                size="small"
              ></el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- -------------------------------------------------- -->
      <el-dialog
        title="Secret"
        :visible.sync="secret_dialog"
        :show-close="false"
        top="5%"
        width="60%"
      >
        <el-tabs tab-position="top">
          <el-tab-pane label="基本信息">
            <MetaData></MetaData>
          </el-tab-pane>
          <el-tab-pane label="配置信息"> </el-tab-pane>
        </el-tabs>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="secret_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_secret"
            >确 定</el-button
          >
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { cloneDeep } from "lodash";
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import json2yaml from "json2yaml";
import { saveAs } from "file-saver";
import {
  initSocketData,
  updateSocketData,
  sendSocketMessage,
  encodeify,
  binaryToStr,
} from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

import MetaData from "../components/metadata.vue";
import yamlViewer from "../components/yamlViewer.vue";

const ConfigMapObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
  data: {},
  binarydata: {},
};

const SecretObj = {
  metadata: {
    name: "",
    namespace: "",
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
  data: {},
  type: "",
  stringData: {},
};

export default {
  name: "ConfigMapAndSecret",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaData,
    yamlViewer,
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_configmap_list: function () {
      return this.configmap_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  data() {
    return {
      textMap: {
        create_configmap: "新增ConfigMap",
        update_configmap: "编辑ConfigMap",
      },
      dialogStatus: "",
      currentPage: 1,
      active_tab: "ConfigMap",
      configmap_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
          creationTimestamp: {
            seconds: 0,
          },
        },
        data: {},
        binarydata: {},
      },
      configmap_input_visible: false,
      configmap_input_value: "",
      configmap_active_tab: "metadata",
      configmap_data_active_tab: "",
      configmap_data_list: [],
      configmap_list: [],
      configmap_dialog: false,
      secret_list: [],
      secret_dialog: false,
    };
  },
  created() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_configmap_list(ns);
  },
  mounted() {},
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_configmap_list(this.namespace);
    },
  },
  methods: {
    tab_click(tab) {
      if (tab.name === "ConfigMap") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_configmap_list(ns);
      } else if (tab.name === "Secret") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_secret_list(ns);
      }
    },
    configmap_command(command, row) {
      // console.log(command, row);
      if (command === "export") {
        this.export_item(row);
      } else if (command === "export_yaml") {
        this.export_yaml(row);
      }
    },
    export_item(item) {
      const cloneItem = cloneDeep(item);
      let initItem = ConfigMapObj;

      if (initItem.metadata) {
        for (let metaIndex in initItem.metadata) {
          initItem.metadata[metaIndex] = cloneDeep(
            cloneItem.metadata[metaIndex]
          );
        }
      }
      if (initItem.spec) {
        for (let metaIndex in initItem.spec) {
          initItem.spec[metaIndex] = cloneDeep(cloneItem.spec[metaIndex]);
        }
      } else {
        initItem = cloneItem;
      }
      delete initItem.metadata.creationTimestamp;

      let gvkObj = {
        group: "core",
        version: "v1",
        kind: "ConfigMap",
      };
      const encodeItem = encodeify(gvkObj, initItem);
      localStorage.setItem("core-v1-ConfigMap", binaryToStr(encodeItem));
      this.$message({
        type: "success",
        message: "导出成功",
      });
    },
    export_yaml(item) {
      const nsGvk = "core-v1-ConfigMap";
      const gvkArr = nsGvk.split("-");
      const cloneItem = cloneDeep(item);
      let fileName = item.metadata?.name || "";
      let avk = {
        apiVersion: `${gvkArr[0]}/${gvkArr[1]}`,
        kind: `${gvkArr[2]}`,
      };
      const yamlData = json2yaml.stringify(Object.assign(avk, cloneItem));
      const str = new Blob([yamlData], { type: "text/plain;charset=utf-8" });
      saveAs(str, nsGvk + "-" + fileName + "(whole).yaml");
      this.$message({
        type: "success",
        message: "导出成功",
      });
    },
    configmap_input_confirm() {
      let inputValue = this.configmap_input_value;
      if (inputValue) {
        // let push_obj = { name: inputValue };
        // this.configmap_obj.data.findIndex(
        //   (object) => object.name === push_obj.name
        // ) === -1
        if (!this.configmap_obj.data.hasOwnProperty(inputValue)) {
          this.$set(this.configmap_obj.data, inputValue, "");
          // this.configmap_obj.data.push(push_obj);
          this.configmap_data_active_tab = inputValue;
        } else {
          this.$message({ type: "warning", message: "名称冲突" });
        }
      }
      this.configmap_input_visible = false;
      this.configmap_input_value = "";
    },
    configmap_show_input() {
      this.configmap_input_visible = true;
      this.$nextTick((_) => {
        this.$refs.configmap_tag_input.$refs.input.focus();
      });
    },
    configmap_remove_tab(tab) {
      // console.log("===", tab);
      // let tabs = this.configmap_obj.data;
      // let activeName = this.configmap_data_active_tab;

      // if (activeName === tab) {
      //   tabs.forEach((item, index) => {
      //     if (item.name === tab) {
      //       let nextTab = tabs[index + 1] || tabs[index - 1];
      //       if (nextTab) {
      //         activeName = nextTab.name;
      //       }
      //     }
      //   });
      // }
      delete this.configmap_obj.data[tab];
      this.configmap_data_active_tab = Object.keys(this.configmap_obj.data)[0];
      // this.configmap_data_list = tabs.filter((item) => item.name !== tab);
    },
    get_configmap_list(ns) {
      const senddata = initSocketData(ns, "core-v1-ConfigMap", "list");
      sendSocketMessage(senddata, store);
    },
    create_configmap() {
      this.dialogStatus = "create_configmap";
      this.configmap_dialog = true;
      this.configmap_active_tab = "metadata";
      this.configmap_obj = Object.assign({}, ConfigMapObj);
    },
    update_configmap(row) {
      this.dialogStatus = "update_configmap";
      this.configmap_dialog = true;
      this.configmap_obj = Object.assign({}, row);
      this.configmap_data_active_tab = Object.keys(this.configmap_obj.data)[0];
      // console.log(this.configmap_obj);
    },
    onCmCodeChange(val) {
      // console.log(this.configmap_data_active_tab, val);
      // console.log(val);
      this.configmap_obj.data[this.configmap_data_active_tab] = val;
    },
    delete_configmap(row) {},
    submit_configmap() {
      if (this.dialogStatus === "create_configmap") {
        //
      } else if (this.dialogStatus === "update_configmap") {
        // console.log(this.configmap_obj);
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "ConfigMap",
        };
        const item = cloneDeep(this.configmap_obj);
        const param = updateSocketData(gvkObj, item);
        const namespace = localStorage.getItem("k8s_namespace");
        const update_data = initSocketData(
          namespace,
          "core-v1-ConfigMap",
          "update",
          param
        );
        sendSocketMessage(update_data, store);
        this.configmap_dialog = false;
      }
    },
    // --------------------------------------------------
    get_secret_list(ns) {
      const senddata = initSocketData(ns, "core-v1-Secret", "list");
      sendSocketMessage(senddata, store);
    },
    creaet_secret() {
      this.secret_dialog = true;
    },
    update_secret() {},
    delete_secret() {},
    submit_secret() {},
    cancel_delete() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    // --------------------------------------------------
    socket_onmessage(msg) {
      let ns = localStorage.getItem("k8s_namespace");
      const result = protoRequest.Response.decode(msg);
      if (result.code === 1) {
        const err_msg = String.fromCharCode.apply(null, result.raw);
        this.$message({
          type: "error",
          message: err_msg,
        });
      }

      if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "ConfigMap"
      ) {
        const configmap_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(configmap_list);
        configmap_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.configmap_list = [];
        for (let cm of configmap_list) {
          this.configmap_list.push(cm);
        }
      } else if (
        result.verb === "update" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "ConfigMap"
      ) {
        //
        this.$message({
          type: "success",
          message: "修改成功",
        });

        this.get_configmap_list(this.namespace);
      } else if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "Secret"
      ) {
        const secret_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(secret_list);
        this.secret_list = [];
        for (let cm of secret_list) {
          this.secret_list.push(cm);
        }
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
