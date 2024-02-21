<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="danger"
        size="small"
        icon="el-icon-delete"
        :disabled="multiple_pod_list.length === 0"
        @click="batchDelObj"
        >批量删除</el-button
      >
      <el-table
        :data="page_pod_list"
        size="mini"
        empty-text="啥也没有"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>

        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <!-- <el-table-column label="镜像" prop="">
          <template slot-scope="scoped"></template>
        </el-table-column> -->
        <el-table-column label="更新策略/镜像" prop="">
          <template slot-scope="scoped">
            <el-tag size="mini">{{
              showLabelPoliy(scoped.row.metadata) || "Always"
            }}</el-tag>
            <el-tag size="mini" style="margin-left: 5px">{{
              showImage(scoped.row, scoped.row.spec.containers)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="PodIP" prop="status.podIP"></el-table-column>
        <el-table-column label="节点IP" prop="status.hostIP"></el-table-column>
        <el-table-column
          label="节点名称"
          prop="spec.nodeName"
        ></el-table-column>
        <el-table-column label="状态" prop="status.phase">
          <template slot-scope="scoped">
            <el-tag
              v-if="scoped.row.status.phase === 'Running'"
              type="success"
              >{{ scoped.row.status.phase }}</el-tag
            >
            <el-tag v-else type="danger">{{ scoped.row.status.phase }}</el-tag>
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
            <el-tooltip
              class="item"
              effect="dark"
              content="终端"
              placement="top"
            >
              <el-popover placement="left" trigger="click">
                <el-table
                  :data="scoped.row.spec.containers"
                  size="mini"
                  border
                  :show-header="false"
                >
                  <el-table-column
                    property="name"
                    label="Container"
                    width="200"
                  ></el-table-column>
                  <el-table-column label="操作" width="80px;">
                    <template slot-scope="scoped2">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="登录终端"
                        placement="top"
                      >
                        <el-button
                          type="success"
                          icon="el-icon-s-promotion"
                          size="mini"
                          @click="goTerm(scoped.row, scoped2.row)"
                        ></el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  slot="reference"
                  type="success"
                  icon="el-icon-s-platform"
                  size="mini"
                ></el-button>
              </el-popover>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="日志"
              placement="top"
              style="margin-left: 10px"
            >
              <el-popover placement="left" trigger="click">
                <el-table
                  :data="scoped.row.spec.containers"
                  size="mini"
                  border
                  :show-header="false"
                >
                  <el-table-column
                    property="name"
                    label="Container"
                    width="200"
                  ></el-table-column>
                  <el-table-column label="操作" width="180px;">
                    <template slot-scope="scoped3">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="查看实时日志"
                        placement="top"
                      >
                        <el-button
                          type="primary"
                          icon="el-icon-s-promotion"
                          size="mini"
                          @click="viewLog(scoped.row, scoped3.row)"
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="下载当前日志"
                        placement="top"
                      >
                        <el-button
                          type="info"
                          icon="el-icon-download"
                          size="mini"
                          @click="
                            downloadLog(scoped.row, scoped3.row, false, 0)
                          "
                        ></el-button>
                      </el-tooltip>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        content="下载之前日志"
                        placement="top"
                      >
                        <el-button
                          type="info"
                          icon="el-icon-refresh-left"
                          size="mini"
                          @click="downloadLog(scoped.row, scoped3.row, true, 0)"
                        ></el-button>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  slot="reference"
                  type="primary"
                  icon="el-icon-tickets"
                  size="mini"
                ></el-button>
              </el-popover>
            </el-tooltip>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_pod(scoped.row)"
              @cancel="cancel_delete"
            >
              <el-button
                slot="reference"
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        :page-size="10"
        :current-page.sync="currentPage"
        :total="pod_list.length"
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
import { Notification } from "element-ui";
import {
  showLabelPoliy,
  cancel_delete,
  openTerm,
  download,
} from "@/views/k8s/utils/utils";
import {
  initSocketData,
  sendSocketMessage,
  deleteSocketData,
  getGvkGroup,
  returnResponse,
} from "@/api/k8s";

const Podgvk = "core-v1-Pod";
const PodMetricgvk = "metrics.k8s.io-v1beta1-PodMetrics";

export default {
  name: "PodList",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_pod_list: function () {
      this.pod_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.pod_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    isConnected: function (newVal, oldVal) {
      if (newVal === true) {
        this.get_pod_list();
        this.get_pod_metrics_list();
      }
    },
    message: function (newMsg, oldMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const podGvkObj = {
        group: "core",
        version: "v1",
        kind: "Pod",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        podGvkObj,
        this.updateWatch,
        this.get_pod_list
      );
      if (result_list) {
        // console.log(result_list);
        this.pod_list = result_list;
      }
      const metricsGvk = {
        group: "metrics.k8s.io",
        version: "v1beta1",
        kind: "PodMetrics",
      };
      const metrics_list = returnResponse(
        newMsg,
        ns,
        metricsGvk,
        this.updateMetricsWatch,
        this.get_pod_metrics_list
      );
      if (metrics_list) {
        this.pod_metrics_list = metrics_list;
      }
    },
    namespace: function () {
      this.get_pod_list();
      this.get_pod_metrics_list();
    },
  },
  created() {
    this.get_pod_list();
    this.get_pod_metrics_list();
  },
  mounted() {
    this.get_pod_list();
    this.get_pod_metrics_list();
  },
  data() {
    return {
      currentPage: 1,
      table_search: "",
      pod_list: [],
      pod_metrics_list: [],
      multiple_pod_list: [],
    };
  },
  methods: {
    showLabelPoliy,
    cancel_delete,
    handleSelectionChange(val) {
      this.multiple_pod_list = val;
    },
    batchDelObj() {
      this.$confirm("将批量删除所选项目, 是否继续?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          for (const item of this.multiple_pod_list) {
            this.delete_pod(item);
          }
        })
        .catch(() => {
          this.$message({
            type: "warning",
            message: "你考虑的很全面",
          });
        });
    },
    showImage(pod, containers) {
      // const fetchIndex = containers.findIndex((con) => {
      //   return con.name === pod.metadata.name;
      // });
      // let image = "";
      let image = containers[0].image;
      // if (fetchIndex >= 0) {
      // } else {
      //   return "";
      // }
      let arr = image.split("/");
      if (arr.length <= 0) {
        return "";
      }
      if (arr.length >= 2) {
        return arr.splice(-2).join("/");
      } else {
        return arr[0];
      }
    },
    goTerm(pod, container) {
      // console.log(pod, container, "===");
      openTerm(pod, container, "bash");
    },
    viewLog(pod, container) {
      // console.log(pod, container, "===");
      openTerm(pod, container, "log", 0);
    },
    async downloadLog(pod, container, isPre, time) {
      // console.log(pod, container, "===");
      if (isPre) {
        container.previousDownloading = true;
      } else {
        container.currentDownloading = true;
      }
      await download(pod, container, isPre, time);
    },
    get_pod_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Podgvk, "list");
      sendSocketMessage(senddata, store);
    },
    get_pod_metrics_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, PodMetricgvk, "list");
      sendSocketMessage(senddata, store);
    },
    get_cpu_mem(pod) {
      const podInfo = this.pod_metrics_list.filter((item) => {
        return item.metadata.name === pod.metadata.name;
      });
      if (podInfo && podInfo.length >= 1) {
        let cpu = 0;
        let mem = 0;
        for (let con of podInfo[0].containers) {
          cpu += Number(con.usage.cpu.string.slice(0, -1) || 0);
          const memK = this.getmemKi(con.usage.memory.string);
          mem += memK || 0;
        }
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
    delete_pod(row) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkGroup = getGvkGroup(Podgvk);
      const params = deleteSocketData(gvkGroup, row);
      const delete_data = initSocketData(ns, Podgvk, "delete", params);
      sendSocketMessage(delete_data, store);
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.pod_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.pod_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.pod_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.pod_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.pod_list.splice(modIndex, 1);
        }
      }
    },
    updateMetricsWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.pod_metrics_list.unshift(updateRaw);
      }
      if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.pod_metrics_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.pod_metrics_list[modIndex] = updateRaw;
        }
      }
      if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.pod_metrics_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.pod_metrics_list.splice(modIndex, 1);
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
