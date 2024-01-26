<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_openx"
        >新增</el-button
      >
      <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
        >导入</el-button
      >
      <el-button type="primary" size="small" icon="el-icon-bottom"
        >导入YAML</el-button
      >
      <el-button type="info" size="small" icon="el-icon-copy-document"
        >拷贝</el-button
      >
      <el-button type="warning" size="small" icon="el-icon-edit"
        >编辑</el-button
      >
      <el-button type="danger" size="small" icon="el-icon-delete"
        >删除</el-button
      > -->
      <el-table :data="openx_list" size="small" empty-text="啥也没有" border>
        <el-table-column type="selection" width="55"> </el-table-column>
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
                    command="export"
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
                    >YAML</el-dropdown-item
                  >
                  <el-dropdown-item
                    command="export_yaml"
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
    </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import { Notification } from "element-ui";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import { binaryToStr } from "@/views/k8s/utils/utils";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;
import MetadataTpl from "@/components/k8s/metadata";
import OpenxAppTpl from "@/components/k8s/openxapp";

const Openxgvk = "openx.neverdown.org-v1-Openx";
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
    ...mapGetters(["message", "namespace"]),
  },
  created() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_openx_list(ns);
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_openx_list(this.namespace);
    },
  },
  data() {
    return {
      textMap: {
        create_openx: "新增应用",
        update_openx: "编辑应用",
      },
      dialogStatus: "",
      openx_dialog: false,
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
      openx_list: [],
      app_form_list: [],
      app_name_visible: false,
      app_form_appName: "",
      app_index: 0,
    };
  },
  methods: {
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
            // labels: {},
            // annotations: {},
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
      // console.log(row, "==================");
      this.openx_obj = Object.assign({}, row);
      this.app_index = 0;
    },
    delete_openx(row) {
      this.openx_obj = Object.assign({}, row);
      const ns = localStorage.getItem("k8s_namespace");
      const message = protoOpenx["v1"]["Openx"].create(
        this.openx_obj
      );
      const params = protoOpenx["v1"]["Openx"]
        .encode(message)
        .finish();
      const delete_data = initSocketData(
        ns,
        "openx.neverdown.org-v1-Openx",
        "delete",
        params
      );
      sendSocketMessage(delete_data, store);
    },
    cancel_delete() {
      Notification({
        message: "你考虑的很全面",
        type: "warning",
        duration: 3000,
      });
    },
    openx_command(row) {},
    submit_openx() {
      if (this.dialogStatus === "create_openx") {
        console.log(this.openx_obj, "=================");
        const ns = localStorage.getItem("k8s_namespace");
        const message = protoOpenx["v1"]["Openx"].create(this.openx_obj);
        const params = protoOpenx["v1"]["Openx"].encode(message).finish();
        const createdata = initSocketData(
          ns,
          "openx.neverdown.org-v1-Openx",
          "create",
          params
        );
        sendSocketMessage(createdata, store);
        this.openx_dialog = false;
      } else if (this.dialogStatus === "update_openx") {
        //
      }
    },
    get_openx_list(ns) {
      const senddata = initSocketData(ns, Openxgvk, "list");
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      let ns = localStorage.getItem("k8s_namespace");
      const result = protoRequest.Response.decode(msg);
      if (result.code === 1) {
        Notification({
          message: binaryToStr(result.raw),
          type: "error",
          duration: 3000,
        });
      }
      switch (result.verb) {
        case "create":
          if (result.code === 0) {
            Notification({
              title: "新增成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "新增失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          break;
        case "update":
          if (result.code === 0) {
            Notification({
              title: "更新成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "更新失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          break;
        case "delete":
          if (result.code === 0) {
            Notification({
              title: "删除成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "删除失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          this.get_openx_list(ns);
          break;
        case "list":
          if (
            result.namespace === ns &&
            result.groupVersionKind.kind === "Openx"
          ) {
            const openx_list = protoOpenx["v1"][
              `${result.groupVersionKind.kind}List`
            ].decode(result.raw).items;
            openx_list.sort((itemA, itemB) => {
              return (
                itemB.metadata.creationTimestamp.seconds -
                itemA.metadata.creationTimestamp.seconds
              );
            });
            this.openx_list = [];
            for (const item of openx_list) {
              this.openx_list.push(item);
            }
          }
          break;
        case "watch":
          const watchEvent = protoRequest.WatchEvent.decode(result.raw);
          const decodeRaw = protoOpenx["v1"]["Openx"].decode(watchEvent.raw);
          if (watchEvent.type === "ADDED") {
            this.openx_list.unshift(decodeRaw);
          }
          break;
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
