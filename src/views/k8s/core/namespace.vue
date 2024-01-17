事件
<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button type="primary" size="small" icon="el-icon-plus"
        >新增</el-button
      >
      <el-table
        :data="page_namespace_list"
        size="small"
        empty-text="啥也没有"
        border
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"> </el-table-column>
        <el-table-column label="标签/注解">
          <template>
            <el-tooltip
              class="item"
              effect="dark"
              content="标签"
              placement="top"
            >
              <svg-icon
                class="el-icon"
                icon-class="tags"
                style="font-size: 20px; vertical-align: middle"
              ></svg-icon>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="标签"
              placement="top"
            >
              <svg-icon
                class="el-icon"
                icon-class="annotation"
                style="font-size: 20px; vertical-align: middle"
              ></svg-icon>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status.phase"> </el-table-column>
        <el-table-column label="时间">
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
              @click="update_namespace(scoped.row)"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_namespace(scoped.row)"
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
        :total="namespace_list.length"
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
  name: "Namespace",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  data() {
    return {
      currentPage: 1,
      namespace_list: [],
    };
  },
  computed: {
    ...mapGetters(["message"]),
    page_namespace_list: function () {
      return this.namespace_list.slice(
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
    this.get_namespace_list();
  },
  methods: {
    update_namespace() {},
    delete_namespace() {},
    get_namespace_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, "core-v1-Namespace", "list");
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
        result.groupVersionKind.kind === "Namespace"
      ) {
        console.log("ns:", result);
        const namespace_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(namespace_list);
        namespace_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.namespace_list = [];
        for (let ns of namespace_list) {
          this.namespace_list.push(ns);
        }
      }
    },
    // --------------------------------------------------
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
