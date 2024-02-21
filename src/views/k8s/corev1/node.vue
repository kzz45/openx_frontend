<template>
  <div class="app-container">
    <el-card class="box-card">
      <!-- <el-button type="primary" size="small" icon="el-icon-circle-plus"
        >新增</el-button
      > -->
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
        <el-table-column label="操作" width="120px;">
          <template slot-scope="scoped">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="update_node(scoped.row)"
            ></el-button>
            <!-- <el-tooltip
              class="item"
              effect="dark"
              :content="scoped.row.spec.unschedulable ? '启动调度' : '暂停调度'"
              placement="top"
            >
              <el-button
                :type="scoped.row.spec.unschedulable ? 'success' : 'danger'"
                :icon="
                  scoped.row.spec.unschedulable
                    ? 'el-icon-video-play'
                    : 'el-icon-video-pause'
                "
                size="small"
                @click="taints_node(scoped.row)"
              ></el-button>
            </el-tooltip> -->
            <el-popconfirm
              :title="scoped.row.spec.unschedulable ? '启动调度' : '暂停调度'"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="taints_node(scoped.row)"
              @cancel="cancel_taints"
            >
              <el-button
                slot="reference"
                :type="scoped.row.spec.unschedulable ? 'success' : 'danger'"
                :icon="
                  scoped.row.spec.unschedulable
                    ? 'el-icon-video-play'
                    : 'el-icon-video-pause'
                "
                size="small"
              ></el-button>
            </el-popconfirm>
            <!-- <el-tooltip
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
            </el-tooltip> -->
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

      <el-dialog title="Node" :visible.sync="node_dialog" width="60%">
        <el-form
          ref="node_obj_refs"
          :model="node_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="dialog_tabs">
            <el-tab-pane label="元数据" name="metadata">
              <MetaDataTpl
                ref="metadatatpl"
                :metadata="node_obj.metadata"
              ></MetaDataTpl>
            </el-tab-pane>
            <el-tab-pane label="配置信息" name="spec">
              <el-form-item label="不可调度" prop="spec.unschedulable">
                <el-select v-model="node_obj.spec.unschedulable">
                  <el-option label="是" :value="true"></el-option>
                  <el-option label="否" :value="false"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="污点">
                <el-button
                  type="primary"
                  icon="el-icon-circle-plus"
                  size="small"
                  @click="add_node_taint"
                  >新增</el-button
                >
              </el-form-item>
              <el-form-item label="污点信息" prop="spec.taints">
                <el-table :data="node_obj.spec.taints" border size="mini">
                  <el-table-column label="效果" prop="effect">
                    <template slot-scope="scoped">
                      <el-input
                        v-if="scoped.row.isSet"
                        v-model="scoped.row.effect"
                        size="mini"
                      ></el-input>
                      <el-input
                        v-else
                        v-model="scoped.row.effect"
                        size="mini"
                        disabled
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="键" prop="key">
                    <template slot-scope="scoped">
                      <el-input
                        v-if="scoped.row.isSet"
                        v-model="scoped.row.key"
                        size="mini"
                      ></el-input>
                      <el-input
                        v-else
                        v-model="scoped.row.key"
                        size="mini"
                        disabled
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="值" prop="value">
                    <template slot-scope="scoped">
                      <el-input
                        v-if="scoped.row.isSet"
                        v-model="scoped.row.value"
                        size="mini"
                      ></el-input>
                      <el-input
                        v-else
                        v-model="scoped.row.value"
                        size="mini"
                        disabled
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120px">
                    <template slot-scope="scoped">
                      <el-button
                        type="primary"
                        size="mini"
                        :icon="
                          scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                        "
                        @click="tains_edit(scoped.row, scoped.row.isSet)"
                      ></el-button>
                      <el-button
                        v-if="!scoped.row.isSet"
                        type="danger"
                        icon="el-icon-delete"
                        size="mini"
                        @click="tains_del(node_obj.spec.taints, scoped.$index)"
                      ></el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="node_dialog = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submit_node"
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
      textMap: {
        create_node: "新增",
        update_node: "编辑",
      },
      dialogStatus: "",
      currentPage: 1,
      node_obj: {
        metadata: {
          name: "",
          namespace: localStorage.getItem("k8s_namespace"),
          annotations: {},
          labels: {},
        },
        spec: {
          externalID: "",
          podCIDR: "",
          podCIDRs: [],
          providerID: "",
          taints: [],
          unschedulable: false,
        },
      },
      node_dialog: false,
      dialog_tabs: "metadata",
      node_list: [],
      node_metrics_list: [],
      affinity_list: [],
      toleration_list: [],
    };
  },
  methods: {
    add_node_taint() {
      const tempTain = {
        isSet: false,
        effect: "NoSchedule",
        key: "key",
        value: "",
      };
      this.node_obj.spec.taints.push(tempTain);
    },
    tains_edit(row, isSet) {
      row.isSet = !isSet;
    },
    tains_del(allData, index) {
      allData.splice(index, 1);
    },
    taints_node(row) {
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Node",
      };
      if (row.spec.unschedulable) {
        let item = cloneDeep(row);
        item.spec.unschedulable = false;
        item.spec.taints = [];
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const updatedata = initSocketData(ns, "core-v1-Node", "update", param);
        sendSocketMessage(updatedata, store);
      } else {
        let item = cloneDeep(row);
        item.spec.unschedulable = true;
        item.spec.taints.push({
          effect: "NoSchedule",
          key: "node.kubernetes.io/unschedulable",
          value: "",
        });
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const updatedata = initSocketData(ns, "core-v1-Node", "update", param);
        sendSocketMessage(updatedata, store);
      }
    },
    cancel_taints() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    update_node(row) {
      this.node_dialog = true;
      this.dialogStatus = "update_node";
      this.node_obj = Object.assign({}, row);
      const temptaint = [];
      for (const taint of this.node_obj.spec.taints) {
        const temp = Object.assign({}, taint);
        temp.isSet = false;
        temptaint.push(temp);
      }
      this.node_obj.spec.taints = temptaint;
    },
    submit_node() {
      if (this.dialogStatus === "update_node") {
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "Node",
        };
        const item = cloneDeep(this.node_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const updatedata = initSocketData(ns, "core-v1-Node", "update", param);
        sendSocketMessage(updatedata, store);
        this.node_dialog = false;
      }
    },
    get_cpu_mem(node) {
      const nodeInfo = this.node_metrics_list.filter((item) => {
        return item.metadata.name === node.metadata.name;
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
