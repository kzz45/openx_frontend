<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs v-model="active_tab" @tab-click="tab_click">
        <el-tab-pane label="节点" name="node">
          <el-button type="primary" size="small" icon="el-icon-plus"
            >新增</el-button
          >
          <el-table
            :data="page_node_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="名称" prop="metadata.name">
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="scoped">
                {{ scoped.row.status.conditions.slice(-1)[0].type }}
              </template>
            </el-table-column>
            <!-- <el-table-column label="CPU/内存"></el-table-column> -->
            <el-table-column label="污点">
              <template slot-scope="scoped">
                <div
                  v-for="(item, index) in scoped.row.spec.taints"
                  :key="index"
                >
                  <el-tag size="mini" type="warning">{{ item.effect }}</el-tag>
                  <el-tag size="mini">{{ item.key }}</el-tag>
                  <el-tag size="mini">{{ item.value }}</el-tag>
                </div>
              </template>
            </el-table-column>
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
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="暂停调度"
                  placement="top"
                >
                  <el-button
                    type="warning"
                    icon="el-icon-video-pause"
                    size="mini"
                  ></el-button>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="排空节点"
                  placement="top"
                >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                  ></el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            :page-size="10"
            :current-page.sync="currentPage"
            :total="node_list.length"
            layout="total, prev, pager, next"
            style="text-align: left; margin-top: 20px"
          >
          </el-pagination>
        </el-tab-pane>
        <el-tab-pane label="亲和" name="affinity">
          <el-table
            :data="affinity_list"
            size="small"
            empty-text="啥也没有"
            border
          ></el-table>
        </el-tab-pane>
        <el-tab-pane label="容忍" name="toleration">
          <el-table
            :data="toleration_list"
            size="small"
            empty-text="啥也没有"
            border
          ></el-table>
        </el-tab-pane>
      </el-tabs>
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

import MetaData from "../components/metadata.vue";

const NodeObj = {
  metadata: {
    name: "",
    namespace: "",
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
  spec: {
    externalID: "",
    podCIDR: "",
    podCIDRs: [],
    providerID: "",
    taints: [],
    unschedulable: false,
  },
};

export default {
  name: "Node",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaData,
  },
  computed: {
    ...mapGetters(["message"]),
    page_node_list: function () {
      return this.node_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
  },
  mounted() {
    this.get_node_list();
    // console.log(this.node_list);
  },
  data() {
    return {
      active_tab: "node",
      currentPage: 1,
      node_list: [],
      affinity_list: [],
      toleration_list: [],
    };
  },
  methods: {
    tab_click() {},
    get_node_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, "core-v1-Node", "list");
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
      if (result.verb === "list" && result.namespace === ns) {
        const node_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(node_list);
        node_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.node_list = [];
        for (let node of node_list) {
          this.node_list.push(node);
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
