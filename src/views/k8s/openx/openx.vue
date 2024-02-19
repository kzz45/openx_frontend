<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_openx"
        >新增</el-button
      >
      <el-button type="primary" size="small" icon="el-icon-bottom"
        >导入</el-button
      >
      <el-button type="primary" size="small" icon="el-icon-bottom"
        >从YAML导入</el-button
      >
      <el-button
        v-if="multiple_openx_list.length > 0"
        type="info"
        size="small"
        icon="el-icon-copy-document"
        @click="copyObjToNs"
        >拷贝</el-button
      >
      <el-button
        v-if="multiple_openx_list.length > 0"
        type="warning"
        size="small"
        icon="el-icon-edit"
        @click="batchEditObj"
        >编辑</el-button
      >
      <el-button
        v-if="multiple_openx_list.length > 0"
        type="danger"
        size="small"
        icon="el-icon-delete"
        @click="batchDelObj"
        >删除</el-button
      >
      <el-table
        :data="page_openx_list"
        size="small"
        empty-text="啥也没有"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column label="应用名称">
          <template slot-scope="scoped">
            <div
              v-for="(info, index) in getInfoInGvk(
                'applications',
                scoped.row,
                'openx.neverdown.org-v1-Openx'
              )"
              :key="index"
            >
              <el-tag effect="dark" @click.stop="update_openx(scoped.row)">{{
                info.appName
              }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="副本/状态">
          <template slot-scope="scoped">
            <div
              v-for="(info, index) in getInfoInGvk(
                'init',
                scoped.row,
                'openx.neverdown.org-v1-Openx'
              )"
              :key="index"
            >
              <el-tag effect="dark" @click.stop="update_openx(scoped.row)">{{
                info.replicas
              }}</el-tag>
              <el-button
                v-if="Number(info.replicas) > 0"
                type="danger"
                icon="el-icon-video-pause"
                @click.stop="stop_app(scoped.row)"
                size="small"
                style="margin-left: 10px"
                >Stop</el-button
              >
              <el-button
                v-else
                type="primary"
                size="small"
                icon="el-icon-video-play"
                @click.stop="start_app(scoped.row)"
                style="margin-left: 10px"
                >Start</el-button
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="命名空间"
          prop="metadata.namespace"
        ></el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scoped">
            {{ formatTime(scoped.row.metadata.creationTimestamp.seconds) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scoped">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="update_openx(scoped.row)"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_openx(scoped.row)"
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
                trigger="hover"
                @command="
                  (command) => {
                    openx_command(command, scoped.row);
                  }
                "
              >
                <el-button type="warning" icon="el-icon-menu" size="small">
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    command="autoscale"
                    icon="el-icon-c-scale-to-original"
                    style="color: #f8c471"
                    >伸缩</el-dropdown-item
                  >
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
                  <el-dropdown-item
                    command="restart"
                    icon="el-icon-refresh"
                    style="color: #ec7063"
                    >重启</el-dropdown-item
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
        :total="openx_list.length"
        layout="total, prev, pager, next"
        style="text-align: left; margin-top: 20px"
      >
      </el-pagination>
      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="openx_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="openx_obj_refs"
          :model="openx_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="dialog_tabs">
            <el-tab-pane label="元数据" name="metadata">
              <MetadataTpl
                ref="metadatatpl"
                :metadata="openx_obj.metadata"
              ></MetadataTpl>
            </el-tab-pane>
            <el-tab-pane label="应用" name="app">
              <el-tag
                v-for="(app_form, index) in openx_obj.spec.applications"
                :key="index"
                closable
                :disable-transitions="false"
                type="primary"
                effect="dark"
                @close="close_app_tag(app_form)"
                @click="app_tag_click(app_form, index)"
                style="margin-right: 10px"
              >
                {{ app_form.appName }}
              </el-tag>
              <el-input
                v-if="app_name_visible"
                v-model="app_form_appName"
                ref="appTagInput"
                class="input-new-tag"
                size="small"
                style="margin-right: 10px"
                @keyup.enter.native="add_app_form"
                @blur="add_app_form"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="app_name_input"
                >+ 添加</el-button
              >
              <el-divider content-position="right">应用配置</el-divider>
              <OpenxAppTpl
                v-if="openx_obj.spec.applications.length > 0"
                :application_form="openx_obj.spec.applications[this.app_index]"
              ></OpenxAppTpl>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="openx_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_openx"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="autoscale_dialog"
        width="40%"
      >
        <el-form
          ref="openx_autoscale_obj_refs"
          :model="openx_autoscale_obj"
          size="small"
          label-width="100px"
        >
          <el-row
            v-for="(item, index) in openx_autoscale_obj.spec.applications"
            :key="index"
          >
            <el-col :span="12">
              <el-form-item label="应用名称" prop="name">
                <el-tag>{{ item.pod.spec.containers[0].name }}</el-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="副本" name="replicas">
                <el-input-number
                  v-model="item.replicas"
                  size="small"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="autoscale_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_openx"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="copyobj_dialog"
        width="40%"
      >
        <el-form
          ref="openx_copy_obj_refs"
          :model="openx_copy_obj"
          size="small"
          label-width="100px"
        >
          <el-form-item label="目标命名空间" name="namespace">
            <el-select
              v-model="openx_copy_obj.metadata.namespace"
              placeholder=""
            >
              <el-option
                v-for="(item, index) in namespace_list"
                :label="item"
                :value="item"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="copyobj_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_openx"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="batchedit_dialog"
        width="40%"
      ></el-dialog>
    </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import json2yaml from "json2yaml";
import { saveAs } from "file-saver";
import { parseTime } from "@/utils";
import { Notification } from "element-ui";
import { cloneDeep, debounce } from "lodash";
import {
  initSocketData,
  sendSocketMessage,
  updateSocketData,
  deleteSocketData,
  returnResponse,
} from "@/api/k8s";
import {
  binaryToStr,
  formatTime,
  getInfoInGvk,
  initObject,
  encodeify,
  cancel_delete,
} from "@/views/k8s/utils/utils";

import MetadataTpl from "@/components/k8s/metadata";
import OpenxAppTpl from "@/components/k8s/openxapp";

const Openxgvk = "openx.neverdown.org-v1-Openx";
const Namespacegvk = "core-v1-Namespace";

const MetadataObj = {
  name: "",
  namespace: localStorage.getItem("k8s_namespace") || "",
  labels: {},
  annotations: {},
};

export default {
  name: "OpenX",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetadataTpl,
    OpenxAppTpl,
  },
  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_openx_list: function () {
      this.openx_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.openx_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  created() {
    this.get_openx_list();
  },
  mounted() {
    this.get_openx_list();
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_openx_list();
      }
    },
    message: function (newVal) {
      let ns = localStorage.getItem("k8s_namespace");
      let openxGvkObj = {
        group: "openx.neverdown.org",
        version: "v1",
        kind: "Openx",
      };
      let openx_result_list = returnResponse(
        newVal,
        ns,
        openxGvkObj,
        this.updateWatch,
        this.get_openx_list
      );
      if (openx_result_list) {
        this.openx_list = openx_result_list;
      }
      let nsGvkObj = {
        group: "core",
        version: "v1",
        kind: "Namespace",
      };
      let ns_result_list = returnResponse(
        newVal,
        ns,
        nsGvkObj,
        "",
        this.get_namespace_list
      );
      if (ns_result_list) {
        this.namespace_list = ns_result_list;
      }
    },
    namespace: function () {
      this.get_openx_list();
    },
  },
  data() {
    return {
      textMap: {
        create_openx: "新增应用",
        update_openx: "编辑应用",
        autoscale: "应用伸缩",
        copyobj: "拷贝应用",
        batchedit: "批量编辑",
      },
      dialogStatus: "",
      openx_dialog: false,
      replicas: 0,
      dialog_tabs: "metadata",
      openx_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
        },
        spec: {
          applications: [],
        },
      },
      autoscale_dialog: false,
      openx_autoscale_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
        },
        spec: {
          applications: [],
        },
      },
      copyobj_dialog: false,
      openx_copy_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
        },
        spec: {
          applications: [],
        },
      },
      batchedit_dialog: false,
      currentPage: 1,
      openx_list: [],
      multiple_openx_list: [],
      app_form_list: [],
      app_name_visible: false,
      app_form_appName: "",
      app_index: 0,
      namespace_list: [],
    };
  },
  methods: {
    binaryToStr,
    formatTime,
    getInfoInGvk,
    cancel_delete,
    loadOver() {
      this.table_loading = false;
    },
    handleSelectionChange(val) {
      // console.log(val, "===========");
      this.multiple_openx_list = val;
      this.namespace_list = [];
      const rules = JSON.parse(localStorage.getItem("clusterRole"));
      for (let rule in rules) {
        this.namespace_list.push(rule);
      }
      console.log(this.namespace_list, "======");
    },
    copyObjToNs() {
      this.dialogStatus = "copyobj";
      this.copyobj_dialog = true;
    },
    batchEditObj() {
      this.dialogStatus = "batchedit";
      this.batchedit_dialog = true;
    },
    batchDelObj() {},
    add_app_form() {
      let app_form_appName = this.app_form_appName;
      let inputIndex = this.app_index;
      if (app_form_appName) {
        const default_app_obj = {
          appIndex: inputIndex,
          appName: app_form_appName,
          replicas: 1,
          watchPolicy: "manual",
          pod: {
            spec: {
              containers: [
                {
                  name: "",
                  image: "",
                  resources: {
                    limits: {},
                    requests: {},
                  },
                  env: [],
                  args: [],
                  ports: [],
                  command: [],
                  volumeMounts: [],
                },
              ],
              volumes: [],
            },
          },
          service: {
            spec: {
              selector: {},
              type: "",
              clusterIP: "",
              ports: [],
            },
          },
        };
        if (
          this.openx_obj.spec.applications.findIndex(
            (object) => object.name === default_app_obj.appName
          ) === -1
        ) {
          this.openx_obj.spec.applications.push(default_app_obj);
        } else {
          this.$message({ type: "warning", message: "名称冲突" });
        }
      }
      this.app_name_visible = false;
      this.app_form_appName = "";
    },
    app_name_input() {
      this.app_name_visible = true;
      this.$nextTick((_) => {
        this.$refs.appTagInput.$refs.input.focus();
      });
    },
    close_app_tag(tag) {
      this.openx_obj.spec.applications.splice(
        this.openx_obj.spec.applications.indexOf(tag),
        1
      );
    },
    app_tag_click(tag, index) {
      this.app_index = index;
    },
    create_openx() {
      this.openx_dialog = true;
      this.dialog_tabs = "metadata";
      this.dialogStatus = "create_openx";
      this.openx_obj.metadata = Object.assign({}, MetadataObj);
      this.openx_obj.spec.applications = [];
    },
    update_openx(row) {
      this.openx_dialog = true;
      this.dialog_tabs = "metadata";
      this.dialogStatus = "update_openx";
      this.openx_obj = Object.assign({}, row);
      this.app_index = 0;
    },
    stop_app(item) {
      const gvkObj = {
        group: "openx.neverdown.org",
        version: "v1",
        kind: "Openx",
      };
      const temp = cloneDeep(item);
      temp.spec.applications[0].replicas = 0;
      const param = updateSocketData(gvkObj, temp);
      const ns = localStorage.getItem("k8s_namespace");
      const updatedata = initSocketData(ns, Openxgvk, "update", param);
      sendSocketMessage(updatedata, store);
    },
    start_app(item) {
      const gvkObj = {
        group: "openx.neverdown.org",
        version: "v1",
        kind: "Openx",
      };
      const temp = cloneDeep(item);
      temp.spec.applications[0].replicas = 1;
      const param = updateSocketData(gvkObj, temp);
      const ns = localStorage.getItem("k8s_namespace");
      const updatedata = initSocketData(ns, Openxgvk, "update", param);
      sendSocketMessage(updatedata, store);
    },
    delete_openx(row) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkGroup = getGvkGroup(Openxgvk);
      const params = deleteSocketData(gvkGroup, row);
      const delete_data = initSocketData(ns, Openxgvk, "delete", params);
      sendSocketMessage(delete_data, store);
    },

    openx_command(command, item) {
      if (command === "export") {
        //导出
        this.export(item);
      } else if (command === "autoscale") {
        //伸缩
        this.autoscale(item);
      } else if (command === "export_yaml") {
        //导出YAML
        this.export_yaml(item);
      } else if (command === "restart") {
        //重启
        this.restart(item);
      }
    },
    autoscale(item) {
      // console.log(item, "=====");
      this.dialogStatus = "autoscale";
      this.autoscale_dialog = true;
      this.openx_autoscale_obj = Object.assign({}, item);
    },
    restart(item) {},
    export(item) {
      const cloneItem = cloneDeep(item);
      const initItem = initObject(Openxgvk);
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
      const gvkArr = Openxgvk.split("-");
      const gvkObj = {
        group: gvkArr[0],
        version: gvkArr[1],
        kind: gvkArr[2],
      };
      const encodeItem = encodeify(gvkObj, initItem);
      localStorage.setItem(Openxgvk, binaryToStr(encodeItem));
      Notification({
        title: "导出成功",
        message: "success",
        type: "success",
        duration: 3000,
      });
    },
    export_yaml(item) {
      // const nsGvk = "openx.neverdown.org-v1-Openx";
      const gvkArr = Openxgvk.split("-");
      const cloneItem = cloneDeep(item);
      let initItem = initObject(Openxgvk);
      let fileName = "";
      if (initItem.spec) {
        for (let metaIndex in initItem.spec) {
          initItem.spec[metaIndex] = cloneDeep(cloneItem.spec[metaIndex]);
        }
      } else {
        for (let itemInitKey in initItem) {
          if (!(itemInitKey == "spec" || itemInitKey == "metadata")) {
            initItem[itemInitKey] = cloneItem[itemInitKey];
          }
        }
      }
      if (initItem.rules) {
        for (let rule of initItem.rules) {
          delete rule.resourceNames;
          delete rule.nonResourceURLs;
        }
      }
      if (initItem.metadata) {
        fileName = item.metadata.name;
        for (let metaIndex in initItem.metadata) {
          initItem.metadata[metaIndex] = cloneDeep(
            cloneItem.metadata[metaIndex]
          );
        }
        let simpleMeta = {
          name: initItem.metadata.name,
          namespace: initItem.metadata.namespace,
          labels: initItem.metadata.labels,
          annotations: initItem.metadata.annotations,
        };
        initItem.metadata = simpleMeta;
      }
      const avk = {
        apiVersion: `${gvkArr[0]}/${gvkArr[1]}`,
        kind: `${gvkArr[2]}`,
      };
      const yamlData = json2yaml.stringify(Object.assign(avk, initItem));
      const str = new Blob([yamlData], { type: "text/plain;charset=utf-8" });
      saveAs(str, Openxgvk + "-" + fileName + ".yaml");
    },
    submit_openx() {
      if (this.dialogStatus === "create_openx") {
        const gvkObj = {
          group: "openx.neverdown.org",
          version: "v1",
          kind: "Openx",
        };
        const item = cloneDeep(this.openx_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const createdata = initSocketData(ns, Openxgvk, "create", param);
        sendSocketMessage(createdata, store);
        this.openx_dialog = false;
      } else if (this.dialogStatus === "update_openx") {
        const gvkObj = {
          group: "openx.neverdown.org",
          version: "v1",
          kind: "Openx",
        };
        const item = cloneDeep(this.openx_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const createdata = initSocketData(ns, Openxgvk, "update", param);
        sendSocketMessage(createdata, store);
        this.openx_dialog = false;
      } else if (this.dialogStatus === "autoscale") {
        const gvkObj = {
          group: "openx.neverdown.org",
          version: "v1",
          kind: "Openx",
        };
        const item = cloneDeep(this.openx_autoscale_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const update_data = initSocketData(ns, Openxgvk, "update", param);
        sendSocketMessage(update_data, store);
        this.autoscale_dialog = false;
      }
    },
    get_openx_list() {
      const ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Openxgvk, "list");
      sendSocketMessage(senddata, store);
    },
    get_namespace_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Namespacegvk, "list");
      sendSocketMessage(senddata, store);
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.openx_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.openx_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.openx_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.openx_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.openx_list.splice(modIndex, 1);
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
