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
        <el-table-column label="操作"></el-table-column>
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
              <MetadataTpl ref="metadatatpl"></MetadataTpl>
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
              <el-divider content-position="right">Container</el-divider>
              <OpenxAppTpl
                v-if="openx_obj.spec.applications.length > 0"
                :app_form="openx_obj.spec.applications[this.app_index]"
              ></OpenxAppTpl>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;
import MetadataTpl from "@/components/k8s/metadata";
import OpenxAppTpl from "@/components/k8s/openxapp";

const Openxgvk = "openx.neverdown.org-v1-Openx";

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
  mounted() {
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
        let default_app_obj = {
          appIndex: inputIndex,
          appName: app_form_appName,
          replicas: 0,
          watchPolicy: "manual",
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
      this.dialogStatus = "create_openx";
      this.openx_obj.spec.applications = [];
    },
    update_openx(row) {},
    delete_openx(row) {},
    submit_openx() {},
    get_openx_list(ns) {
      const senddata = initSocketData(ns, Openxgvk, "list");
      sendSocketMessage(senddata, store);
    },
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
      // console.log("==================", result, "=================");
      if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "Openx"
      ) {
        const openx_list = protoOpenx["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(openx_list, "==============");
        openx_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.openx_list = [];
        for (const item of openx_list) {
          // console.log(item.spec, "======");
          this.openx_list.push(item);
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
