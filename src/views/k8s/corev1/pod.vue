<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button type="danger" size="small" icon="el-icon-delete"
        >删除</el-button
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
        <el-table-column label="更新策略" prop="">
          <template slot-scope="scoped">
            <el-tag>{{ showLabelPoliy(scoped.row.metadata) }}</el-tag>
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
        <!-- <el-table-column label="重启次数"></el-table-column> -->
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
        <el-table-column align="right" width="200px">
          <template slot="header" slot-scope="scope">
            <el-input
              v-model="table_search"
              size="mini"
              placeholder="输入关键字搜索"
              style="width: 160px"
            ></el-input>
          </template>
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
                  <el-table-column label="操作">
                    <template>
                      <el-button
                        type="success"
                        icon="el-icon-s-promotion"
                        size="mini"
                      ></el-button>
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
                  <el-table-column label="操作">
                    <template>
                      <el-button
                        type="primary"
                        icon="el-icon-s-promotion"
                        size="mini"
                      ></el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-button
                  slot="reference"
                  type="primary"
                  icon="el-icon-camera"
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
        <!-- <el-table-column label="操作" width="180px;"> -->

        <!-- </el-table-column> -->
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
import { showLabelPoliy, cancel_delete } from "@/views/k8s/utils/utils";
import {
  initSocketData,
  sendSocketMessage,
  deleteSocketData,
  getGvkGroup,
  returnResponse,
} from "@/api/k8s";
// import protoRoot from "@/proto/proto";
// const protoApi = protoRoot.k8s.io.api;
// const protoRequest =
//   protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

const Podgvk = "core-v1-Pod";

function get_pod_list() {
  const ns = localStorage.getItem("k8s_namespace");
  const senddata = initSocketData(ns, Podgvk, "list");
  sendSocketMessage(senddata, store);
}

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
      }
    },
    message: function (newMsg, oldMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Pod",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_pod_list
      );
      if (result_list) {
        this.pod_list = result_list;
      }
    },
    namespace: function () {
      this.get_pod_list();
    },
  },
  created() {
    this.get_pod_list();
  },
  mounted() {
    this.get_pod_list();
  },
  data() {
    return {
      currentPage: 1,
      table_search: "",
      pod_list: [],
      multiple_pod_list: [],
    };
  },
  methods: {
    showLabelPoliy,
    cancel_delete,
    handleSelectionChange(val) {
      console.log(val);
      this.multiple_pod_list = val;
    },
    get_pod_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Podgvk, "list");
      sendSocketMessage(senddata, store);
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
        console.log("updateWatch", types, updateRaw, modIndex);
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
