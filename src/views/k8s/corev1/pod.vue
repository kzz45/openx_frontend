<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button type="danger" size="small" icon="el-icon-delete"
        >批量删除</el-button
      >
      <el-table :data="pod_list" size="mini" empty-text="啥也没有" border>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column
          label="命名空间"
          prop="metadata.namespace"
        ></el-table-column>
        <el-table-column label="PodIP" prop="status.podIP"></el-table-column>
        <el-table-column label="Node" prop="status.hostIP"></el-table-column>
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
        <el-table-column label="创建时间">
          <template slot-scope="scoped">
            {{
              scoped.row.metadata.creationTimestamp.seconds
                | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px;">
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
import { binaryToStr } from "@/views/k8s/utils/utils";
import {
  initSocketData,
  sendSocketMessage,
  deleteSocketData,
  getGvkGroup,
  returnResponse,
} from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

const Podgvk = "core-v1-Pod";

export default {
  name: "PodList",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_pod_list: function () {
      return this.pod_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  created() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_pod_list(ns);
  },
  watch: {
    message: function (newMsg, oldMsg) {
      let ns = localStorage.getItem("k8s_namespace");
      let gvkObj = {
        group: "core",
        version: "v1",
        kind: "Pod",
      };
      let result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        function () {},
        this.updateWatch(),
        this.get_pod_list(ns)
      );
      if (result_list) {
        this.pod_list = result_list;
      }
    },
    namespace: function () {
      this.get_pod_list(this.namespace);
    },
  },
  data() {
    return {
      currentPage: 1,
      pod_list: [],
    };
  },
  methods: {
    tableRowStyle({ row, rowIndex }) {
      let rowBackground = {};
      if (row.status.phase === "Running") {
        return rowBackground;
      } else {
        rowBackground.background = "#f56c6c";
        return rowBackground;
      }
    },
    get_pod_list(ns) {
      const senddata = initSocketData(ns, Podgvk, "list");
      sendSocketMessage(senddata, store);
    },
    delete_pod(row) {
      let ns = localStorage.getItem("k8s_namespace");
      const gvkGroup = getGvkGroup(Podgvk);
      const params = deleteSocketData(gvkGroup, row);
      const delete_data = initSocketData(ns, Podgvk, "delete", params);
      sendSocketMessage(delete_data, store);
    },
    // --------------------------------------------------
    // socket_onmessage(msg) {
    //   let ns = localStorage.getItem("k8s_namespace");
    //   const result = protoRequest.Response.decode(msg);
    //   if (result.code === 1) {
    //     Notification({
    //       message: binaryToStr(result.raw),
    //       type: "error",
    //       duration: 3000,
    //     });
    //   }
    //   switch (result.verb) {
    //     case "list":
    //       if (
    //         result.namespace === ns &&
    //         result.groupVersionKind.kind === "Pod"
    //       ) {
    //         const pod_list = protoApi["core"]["v1"][
    //           `${result.groupVersionKind.kind}List`
    //         ].decode(result.raw).items;
    //         pod_list.sort((itemA, itemB) => {
    //           return (
    //             itemB.metadata.creationTimestamp.seconds -
    //             itemA.metadata.creationTimestamp.seconds
    //           );
    //         });
    //         this.pod_list = [];
    //         for (let item of pod_list) {
    //           this.pod_list.push(item);
    //         }
    //       }
    //       break;
    //     case "create":
    //       break;
    //     case "delete":
    //       if (result.code === 0) {
    //         Notification({
    //           title: "删除成功",
    //           message: "success",
    //           type: "success",
    //           duration: 3000,
    //         });
    //       } else {
    //         Notification({
    //           title: "删除失败",
    //           message: binaryToStr(result.raw),
    //           type: "error",
    //           duration: 3000,
    //         });
    //       }
    //       this.get_pod_list(ns);
    //       break;
    //     case "update":
    //       break;
    //     case "watch":
    //       const watchEvent = protoRequest.WatchEvent.decode(result.raw);
    //       const decodeRaw = protoApi["core"]["v1"]["Pod"].decode(
    //         watchEvent.raw
    //       );
    //       // console.log(watchEvent.type, "=============", decodeRaw);

    //       break;
    //   }
    // },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.pod_list.unshift(decodeRaw);
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
