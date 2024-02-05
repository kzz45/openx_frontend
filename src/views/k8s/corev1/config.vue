<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_configmap"
        >新增</el-button
      >
      <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入YAML</el-button
          >
          <el-button type="warning" size="small" icon="el-icon-edit"
            >批量编辑</el-button
          >
          <el-button type="danger" size="small" icon="el-icon-delete"
            >批量删除</el-button
          >
          <el-button type="info" size="small" icon="el-icon-copy-document"
            >拷贝</el-button
          > -->
      <el-table
        :data="page_configmap_list"
        size="small"
        empty-text="啥也没有"
        border
      >
        <el-table-column type="selection" width="50"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column
          label="命名空间"
          prop="metadata.namespace"
        ></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scoped">
            {{
              scoped.row.metadata.creationTimestamp.seconds
                | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px;">
          <template slot-scope="scoped">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="update_configmap(scoped.row)"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_configmap(scoped.row)"
              @cancel="cancel_delete"
            >
              <el-button
                slot="reference"
                type="danger"
                icon="el-icon-delete"
                size="small"
              ></el-button>
            </el-popconfirm>
            <el-tooltip
              class="item"
              effect="dark"
              content="更多"
              placement="top"
              style="margin-left: 10px"
            >
              <el-dropdown
                trigger="click"
                @command="
                  (command) => {
                    configmap_command(command, scoped.row);
                  }
                "
              >
                <el-button type="warning" icon="el-icon-menu" size="small">
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    command="export"
                    icon="el-icon-top"
                    style="color: #409eff"
                    >导出</el-dropdown-item
                  >
                  <el-dropdown-item
                    command="export_yaml"
                    icon="el-icon-document"
                    style="color: #67c23a"
                    >导出YAML</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :page-size="10"
        :current-page.sync="currentPage"
        :total="configmap_list.length"
        layout="total, prev, pager, next"
        style="text-align: left; margin-top: 20px"
      >
      </el-pagination>
      <!-- -------------------------------------------------- -->
      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="configmap_dialog"
        width="60%"
      >
        <el-form
          ref="configmap_obj_refs"
          :model="configmap_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="configmap_active_tab">
            <el-tab-pane label="元数据" name="metadata">
              <MetaDataTpl :metadata="configmap_obj.metadata"></MetaDataTpl>
            </el-tab-pane>
            <el-tab-pane label="配置数据" name="data">
              <el-row>
                <el-col :span="12">
                  <el-input
                    ref="configmap_tag_input"
                    v-if="configmap_input_visible"
                    v-model="configmap_input_value"
                    size="small"
                    class="input-new-tag"
                    @keyup.enter.native="configmap_input_confirm"
                    @blur="configmap_input_confirm"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="configmap_show_input"
                    >+ New Tag</el-button
                  >
                </el-col>
              </el-row>
              <el-row style="margin-top: 10px">
                <el-col>
                  <el-tabs
                    v-model="configmap_data_active_tab"
                    closable
                    @tab-remove="configmap_remove_tab"
                  >
                    <el-tab-pane
                      v-for="(value, key) in configmap_obj.data"
                      :label="key"
                      :name="key"
                      :key="key"
                    >
                      <YamlViewerTpl
                        :value="value"
                        @changed="onCmCodeChange"
                      ></YamlViewerTpl>
                    </el-tab-pane>
                  </el-tabs>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="configmap_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_configmap"
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
import { Notification } from "element-ui";
import json2yaml from "json2yaml";
import { saveAs } from "file-saver";
import {
  initSocketData,
  updateSocketData,
  deleteSocketData,
  sendSocketMessage,
  returnResponse,
  getGvkGroup,
  encodeify,
  binaryToStr,
} from "@/api/k8s";

import MetaDataTpl from "@/components/k8s/metadata.vue";
import YamlViewerTpl from "../components/yamlviewer.vue";

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

const ConfigMapgvk = "core-v1-ConfigMap";

export default {
  name: "ConfigMap",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaDataTpl,
    YamlViewerTpl,
  },
  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_configmap_list: function () {
      this.configmap_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.configmap_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  data() {
    return {
      textMap: {
        create_configmap: "新增",
        update_configmap: "编辑",
      },
      dialogStatus: "",
      currentPage: 1,
      active_tab: "ConfigMap",
      configmap_obj: {
        metadata: {
          name: "",
          namespace: localStorage.getItem("k8s_namespace"),
          annotations: {},
          labels: {},
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
    };
  },
  created() {
    this.get_configmap_list();
  },
  mounted() {
    this.get_configmap_list();
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_configmap_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "ConfigMap",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_configmap_list
      );
      if (result_list) {
        this.configmap_list = result_list;
      }
    },
    namespace: function () {
      this.get_configmap_list();
    },
  },
  methods: {
    configmap_command(command, row) {
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
      localStorage.setItem(ConfigMapgvk, binaryToStr(encodeItem));
      Notification({
        title: "导出成功",
        message: "success",
        type: "success",
        duration: 3000,
      });
    },
    export_yaml(item) {
      const nsGvk = ConfigMapgvk;
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
      Notification({
        title: "导出成功",
        message: "success",
        type: "success",
        duration: 3000,
      });
    },
    configmap_input_confirm() {
      let inputValue = this.configmap_input_value;
      if (inputValue) {
        if (!this.configmap_obj.data.hasOwnProperty(inputValue)) {
          // this.$set(this.configmap_obj.data, inputValue, "");
          this.configmap_obj.data[inputValue] = "";
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
      delete this.configmap_obj.data[tab];
      this.configmap_data_active_tab = Object.keys(this.configmap_obj.data)[0];
    },
    get_configmap_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, ConfigMapgvk, "list");
      sendSocketMessage(senddata, store);
    },
    create_configmap() {
      this.dialogStatus = "create_configmap";
      this.configmap_dialog = true;
      this.configmap_active_tab = "metadata";
      this.configmap_obj = Object.assign({}, ConfigMapObj);
      this.configmap_obj.data = Object.assign({}, "");
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
    delete_configmap(row) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkGroup = getGvkGroup(ConfigMapgvk);
      const params = deleteSocketData(gvkGroup, row);
      const delete_data = initSocketData(ns, ConfigMapgvk, "delete", params);
      sendSocketMessage(delete_data, store);
    },
    submit_configmap() {
      if (this.dialogStatus === "create_configmap") {
        // console.log(this.configmap_obj);
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "ConfigMap",
        };
        const item = cloneDeep(this.configmap_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const create_data = initSocketData(
          ns,
          "core-v1-ConfigMap",
          "create",
          param
        );
        sendSocketMessage(create_data, store);
        this.configmap_dialog = false;
      } else if (this.dialogStatus === "update_configmap") {
        // console.log(this.configmap_obj);
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "ConfigMap",
        };
        const item = cloneDeep(this.configmap_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const update_data = initSocketData(
          ns,
          "core-v1-ConfigMap",
          "update",
          param
        );
        sendSocketMessage(update_data, store);
        this.configmap_dialog = false;
      }
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.configmap_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.configmap_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.configmap_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.configmap_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.configmap_list.splice(modIndex, 1);
        }
      }
    },
    cancel_delete() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
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
