<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs v-model="active_tab" @tab-click="tab_click">
        <el-tab-pane label="ServiceAccount" name="ServiceAccount">
          <el-button type="primary" size="small" icon="el-icon-circle-plus"
            >新增</el-button
          >
          <el-table
            :data="page_serviceaccount_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column
              label="名称"
              prop="metadata.name"
            ></el-table-column>
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
              <template slot-scope="scoped">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="update_serviceaccount(scoped.row)"
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
        </el-tab-pane>
        <el-tab-pane label="ClusterRole" name="ClusterRole">
          <el-button type="primary" size="small" icon="el-icon-circle-plus"
            >新增</el-button
          >
          <el-table
            :data="page_clusterrole_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column
              label="名称"
              prop="metadata.name"
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
              <template slot-scope="scoped">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="update_clusterrole(scoped.row)"
                ></el-button>
                <el-popconfirm
                  title="确定删除吗？"
                  confirm-button-text="确定"
                  cancel-button-text="不了"
                  style="margin-left: 10px"
                  @confirm="delete_clusterrole(scoped.row)"
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
            :total="clusterrole_list.length"
            layout="total, prev, pager, next"
            style="text-align: left; margin-top: 20px"
          >
          </el-pagination>
        </el-tab-pane>
        <el-tab-pane label="ClusterRoleBinding" name="ClusterRoleBinding">
          <el-button type="primary" size="small" icon="el-icon-circle-plus"
            >新增</el-button
          >
          <el-table
            :data="page_clusterrolebinding_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column
              label="名称"
              prop="metadata.name"
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
              <template slot-scope="scoped">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="update_clusterrolebinding(scoped.row)"
                ></el-button>
                <el-popconfirm
                  title="确定删除吗？"
                  confirm-button-text="确定"
                  cancel-button-text="不了"
                  style="margin-left: 10px"
                  @confirm="delete_clusterrolebinding(scoped.row)"
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
            :total="clusterrolebinding_list.length"
            layout="total, prev, pager, next"
            style="text-align: left; margin-top: 20px"
          >
          </el-pagination>
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
const protoRbac = protoRoot.k8s.io.api.rbac;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

export default {
  name: "SA",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  data() {
    return {
      currentPage: 1,
      active_tab: "ServiceAccount",
      serviceaccount_list: [],
      clusterrole_list: [],
      clusterrolebinding_list: [],
    };
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_serviceaccount_list: function () {
      return this.serviceaccount_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
    page_clusterrole_list: function () {
      return this.clusterrole_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
    page_clusterrolebinding_list: function () {
      return this.clusterrolebinding_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_serviceaccount_list(this.namespace);
    },
  },
  mounted() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_serviceaccount_list(ns);
  },
  methods: {
    tab_click(tab) {
      if (tab.name === "ServiceAccount") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_serviceaccount_list(ns);
      } else if (tab.name === "ClusterRole") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_clusterrole_list(ns);
      } else if (tab.name === "ClusterRoleBinding") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_clusterrolebinding_list(ns);
      }
    },
    update_serviceaccount() {},
    delete_serviceaccount() {},
    get_serviceaccount_list(ns) {
      const senddata = initSocketData(ns, "core-v1-ServiceAccount", "list");
      sendSocketMessage(senddata, store);
    },
    update_clusterrole() {},
    delete_clusterrole() {},
    get_clusterrole_list(ns) {
      const senddata = initSocketData(
        ns,
        "rbac.authorization.k8s.io-v1-ClusterRole",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    update_clusterrolebinding() {},
    delete_clusterrolebinding() {},
    get_clusterrolebinding_list(ns) {
      const senddata = initSocketData(
        ns,
        "rbac.authorization.k8s.io-v1-ClusterRoleBinding",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
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
        result.namespace === this.namespace &&
        result.groupVersionKind.kind === "ServiceAccount"
      ) {
        const serviceaccount_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(serviceaccount_list);
        serviceaccount_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.serviceaccount_list = [];
        for (let sa of serviceaccount_list) {
          this.serviceaccount_list.push(sa);
        }
      } else if (
        result.verb === "list" &&
        result.namespace === this.namespace &&
        result.groupVersionKind.kind === "ClusterRole"
      ) {
        let clusterrole_list = protoRbac["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(clusterrole_list);
        clusterrole_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.clusterrole_list = [];
        for (let sa of clusterrole_list) {
          this.clusterrole_list.push(sa);
        }
      } else if (
        result.verb === "list" &&
        result.namespace === this.namespace &&
        result.groupVersionKind.kind === "ClusterRoleBinding"
      ) {
        let clusterrolebinding_list = protoRbac["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(clusterrolebinding_list);
        clusterrolebinding_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.clusterrolebinding_list = [];
        for (let sa of clusterrolebinding_list) {
          this.clusterrolebinding_list.push(sa);
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
