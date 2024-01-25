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
        <el-table-column label="操作" width="180px;">
          <template>
            <el-button type="info" icon="el-icon-info" size="small"></el-button>
            <el-button
              type="primary"
              icon="el-icon-top"
              size="small"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="small"
            ></el-button>
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
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="openx_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_openx">
            确 定</el-button
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
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;
import MetadataTpl from "@/components/k8s/metadata";
import OpenxAppTpl from "@/components/k8s/openxapp";

const OpenxObj = {
  metadata: {
    name: "nginx",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
  },
  spec: {
    applications: [
      {
        appName: "nginx",
        replicas: 1,
        watchPolicy: "in-place-upgrade",
        pod: {
          metadata: {},
          spec: {
            containers: [
              {
                name: "nginx",
                image: "nginx:latest",
              },
            ],
          },
        },
      },
    ],
  },
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
  created() {
    const ns = localStorage.getItem("k8s_namespace");
    this.get_openx_list(ns);
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
    create_openx() {
      this.openx_dialog = true;
      this.dialogStatus = "create_openx";
    },
    update_openx() {},
    delete_openx() {},
    submit_openx() {
      if (this.dialogStatus === "create_openx") {
        const ns = localStorage.getItem("k8s_namespace");
        // console.log(OpenxObj, "====================");
        const message = protoOpenx["v1"]["Openx"].create(OpenxObj);
        const params = protoOpenx["v1"]["Openx"].encode(message).finish();
        const createdata = initSocketData(
          ns,
          "openx.neverdown.org-v1-Openx",
          "create",
          params
        );
        sendSocketMessage(createdata, store);
        this.openx_dialog = false;
      }
    },
    get_openx_list(ns) {
      const senddata = initSocketData(
        ns,
        "openx.neverdown.org-v1-Openx",
        "list"
      );
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
          console.log(item, "======");
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
