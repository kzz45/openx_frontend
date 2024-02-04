<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_serviceaccount"
        >新增</el-button
      >
      <el-table
        :data="page_serviceaccount_list"
        size="small"
        empty-text="啥也没有"
        border
      >
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
        <el-table-column label="操作" width="120px;">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_serviceaccount(scoped.row)"
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
      <el-pagination
        background
        :page-size="10"
        :current-page.sync="currentPage"
        :total="serviceaccount_list.length"
        layout="total, prev, pager, next"
        style="text-align: left; margin-top: 20px"
      >
      </el-pagination>
      <!-- -------------------------------------------------- -->
      <el-dialog
        title="Secret"
        :visible.sync="serviceaccount_dialog"
        :show-close="false"
        top="5%"
        width="60%"
      >
        <el-tabs tab-position="top">
          <el-tab-pane label="基本信息">
            <!-- <MetaData></MetaData> -->
          </el-tab-pane>
          <el-tab-pane label="配置信息"> </el-tab-pane>
        </el-tabs>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="serviceaccount_dialog = false"
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
  returnResponse,
  encodeify,
  binaryToStr,
} from "@/api/k8s";

import MetaData from "../components/metadata.vue";
import yamlViewer from "../components/yamlViewer.vue";

const SecretObj = {
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
  type: "",
  stringData: {},
};

export default {
  name: "ServiceAccount",
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
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_serviceaccount_list: function () {
      return this.serviceaccount_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  data() {
    return {
      textMap: {
        create_serviceaccount: "新增",
        update_serviceaccount: "编辑",
      },
      dialogStatus: "",
      currentPage: 1,
      serviceaccount_list: [],
      serviceaccount_dialog: false,
    };
  },
  created() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_serviceaccount_list(ns);
  },
  mounted() {},
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_serviceaccount_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "ServiceAccount",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_serviceaccount_list
      );
      if (result_list) {
        this.serviceaccount_list = result_list;
      }
    },
    namespace: function () {
      this.get_serviceaccount_list();
    },
  },
  methods: {
    get_serviceaccount_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, "core-v1-ServiceAccount", "list");
      sendSocketMessage(senddata, store);
    },
    create_serviceaccount() {
      this.serviceaccount_dialog = true;
      this.dialogStatus = "create_serviceaccount";
    },
    update_serviceaccount(row) {
      this.serviceaccount_dialog = true;
      this.dialogStatus = "update_serviceaccount";
    },
    delete_serviceaccount(row) {},
    submit_secret() {},
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.serviceaccount_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.serviceaccount_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.serviceaccount_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.serviceaccount_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.serviceaccount_list.splice(modIndex, 1);
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
