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
        <!-- <el-table-column label="CPU/内存"></el-table-column> -->
        <el-table-column label="污点">
          <template slot-scope="scoped">
            <div v-for="(item, index) in scoped.row.spec.taints" :key="index">
              <el-tag size="mini" type="warning">{{ item.effect }}</el-tag>
              <el-tag size="mini">{{ item.key }}</el-tag>
              <el-tag size="mini">{{ item.value || "" }}</el-tag>
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
        this.node_list = result_list;
      }
    },
  },
  created() {
    this.get_node_list();
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
    update_node(row) {},
    get_node_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, "core-v1-Node", "list");
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
