<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button type="warning" size="small" icon="el-icon-edit"
        >编辑</el-button
      >
      <el-button type="danger" size="small" icon="el-icon-delete"
        >删除</el-button
      >
      <el-table
        :data="page_pod_list"
        size="mini"
        empty-text="啥也没有"
        border
        fit
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column
          label="命名空间"
          prop="metadata.namespace"
        ></el-table-column>
        <el-table-column label="PodIP" prop="status.podIP"></el-table-column>
        <el-table-column label="Node" prop="status.hostIP"></el-table-column>
        <el-table-column label="状态" prop="status.phase"></el-table-column>
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
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

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
  mounted() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_pod_list(ns);
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
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
    get_pod_list(ns) {
      const senddata = initSocketData(ns, "core-v1-Pod", "list");
      sendSocketMessage(senddata, store);
    },
    delete_pod() {},
    // --------------------------------------------------
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
      if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "Pod"
      ) {
        // console.log("==================", result, "=================");
        const pod_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(pod_list);
        pod_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.pod_list = [];
        for (let svc of pod_list) {
          this.pod_list.push(svc);
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
