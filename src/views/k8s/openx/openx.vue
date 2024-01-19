<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs v-model="active_tab" @tab-click="tab_click">
        <el-tab-pane label="Openx" name="Openx">
          <el-button type="primary" size="small" icon="el-icon-plus"
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
          <el-table
            :data="openx_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="名称"></el-table-column>
            <el-table-column label="更新时间"></el-table-column>
            <el-table-column label="操作"></el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="Affinity" name="Affinity">
          <AffinityTmplate></AffinityTmplate>
        </el-tab-pane>
        <el-tab-pane label="Toleration" name="Toleration">
          <TolerationTemplte></TolerationTemplte>
        </el-tab-pane>
        <!-- <el-tab-pane label="ALB"></el-tab-pane> -->
        <!-- <el-tab-pane label="ACL"></el-tab-pane> -->
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import AffinityTmplate from "./affinity.vue";
import TolerationTemplte from "./toleration.vue";

import store from "@/store";
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;

export default {
  name: "OpenxApp",
  components: {
    AffinityTmplate,
    TolerationTemplte,
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
      active_tab: "Openx",
      openx_list: [],
    };
  },
  methods: {
    tab_click(tab) {},
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
        console.log(openx_list, "==============");
        openx_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        for (const item of openx_list) {
          console.log(item.spec, "======");
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
