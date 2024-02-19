<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button type="primary" size="small" icon="el-icon-circle-plus"
        >新增</el-button
      >
      <el-table
        :data="page_node_list"
        size="small"
        empty-text="啥也没有"
        border
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scoped">
            {{ scoped.row.status.conditions.slice(-1)[0].type }}
          </template>
        </el-table-column>
        <el-table-column label="CPU/内存">
          <template slot-scope="scoped">
            <el-tag size="mini">{{ get_cpu_mem(scoped.row).cpu }}</el-tag>
            <el-tag size="mini" style="margin-left: 5px">{{
              get_cpu_mem(scoped.row).mem
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="污点">
          <template slot-scope="scoped">
            <div v-for="(item, index) in scoped.row.spec.taints" :key="index">
              <el-tag size="mini" type="warning">{{ item.effect }}</el-tag>
              <el-tag size="mini">{{ item.key }}</el-tag>
              <el-tag size="mini">{{ item.value || "空值" }}</el-tag>
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
        <el-table-column label="操作" width="180px;">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="update_node"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="暂停调度"
              placement="top"
            >
              <el-button
                type="warning"
                icon="el-icon-video-pause"
                size="small"
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
                size="small"
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
    </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import {
  initSocketData,
  updateSocketData,
  sendSocketMessage,
  returnResponse,
  encodeify,
  binaryToStr,
} from "@/api/k8s";

import MetaDataTpl from "@/components/k8s/metadata.vue";

const Nodegvk = "core-v1-Node";
const NodeMetricgvk = "metrics.k8s.io-v1beta1-NodeMetrics";

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
    MetaDataTpl,
  },
  computed: {
    ...mapGetters(["message", "isConnected"]),
    page_node_list: function () {
      this.node_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.node_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_node_list();
        this.get_node_metrics_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Node",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_node_list
      );
      if (result_list) {
        console.log(result_list, "=====");
        this.node_list = result_list;
      }

      const metricsGvk = {
        group: "metrics.k8s.io",
        version: "v1beta1",
        kind: "NodeMetrics",
      };
      const metrics_list = returnResponse(
        newMsg,
        ns,
        metricsGvk,
        this.updateNodeMetricsWatch
      );
      if (metrics_list) {
        this.node_metrics_list = metrics_list;
      }
    },
  },
  created() {
    this.get_node_list();
    this.get_node_metrics_list();
  },
  data() {
    return {
      active_tab: "node",
      currentPage: 1,
      node_list: [],
      node_metrics_list: [],
      affinity_list: [],
      toleration_list: [],
    };
  },
  methods: {
    update_node(row) {},
    get_cpu_mem(node) {
      const nodeInfo = this.node_metrics_list.filter((item) => {
        return (item.metadata.name = node.metadata.name);
      });
      if (nodeInfo && nodeInfo.length >= 1) {
        let cpu = 0;
        let mem = 0;
        const nodeA = nodeInfo[0];
        cpu += Number(nodeA.usage.cpu.string.slice(0, -1) || 0);
        const memK = this.getmemKi(nodeA.usage.memory.string);
        mem += memK || 0;
        return { cpu: this.cpu_time(cpu), mem: this.bytesToSize(mem) };
      }
      return { cpu: 0, mem: 0 };
    },
    cpu_time(num) {
      if (num <= 1000) {
        return num + "ns";
      }
      if (Number((num / 1000).toFixed(2)) >= 1000) {
        const usTime = Number((num / 1000).toFixed(2));
        if (Number((usTime / 1000).toFixed(2)) >= 1000) {
          return Number((usTime / 1000000).toFixed(2)) + "s";
        } else {
          return (usTime / 1000).toFixed(2) + "ms";
        }
      } else {
        return (num / 1000).toFixed(2) + "μs";
      }
    },
    bytesToSize(bytes) {
      if (bytes === 0) return "0 Ki";
      let k = 1000,
        sizes = ["Ki", "Mi", "Gi", "Ti", "Pi", "Ei"],
        i = Math.floor(Math.log(bytes) / Math.log(k));

      return (bytes / Math.pow(k, i)).toPrecision(3) + " " + sizes[i];
    },
    getmemKi(stringM) {
      if (!stringM.slice(0, -2)) {
        return 0;
      }
      if (stringM.endsWith("Ki")) return Number(stringM.slice(0, -2));
      if (stringM.endsWith("Mi")) {
        return Number(stringM.slice(0, -2)) * 1024;
      }
      if (stringM.endsWith("Gi")) {
        return Number(stringM.slice(0, -2)) * 1024 * 1024;
      }
      if (stringM.endsWith("Ti")) {
        return Number(stringM.slice(0, -2)) * 1024 * 1024 * 1024;
      }
      if (stringM.endsWith("Pi")) {
        return Number(stringM.slice(0, -2)) * 1024 * 1024 * 1024 * 1024;
      }
      if (stringM.endsWith("Ei")) {
        return Number(stringM.slice(0, -2)) * 1024 * 1024 * 1024 * 1024 * 1024;
      }
    },
    get_node_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Nodegvk, "list");
      sendSocketMessage(senddata, store);
    },
    get_node_metrics_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, NodeMetricgvk, "list");
      sendSocketMessage(senddata, store);
    },
    // 亲和性
    get_affinity_list(ns) {
      const senddata = initSocketData(
        ns,
        "openx.neverdown.org-v1-Affinity",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    get_toleration_list(ns) {
      const senddata = initSocketData(
        ns,
        "openx.neverdown.org-v1-Toleration",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.node_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.node_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.node_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.node_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.node_list.splice(modIndex, 1);
        }
      }
    },
    updateNodeMetricsWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.node_metrics_list.unshift(updateRaw);
      }
      if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.node_metrics_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.node_metrics_list[modIndex] = updateRaw;
        }
      }
      if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.node_metrics_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.node_metrics_list.splice(modIndex, 1);
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
