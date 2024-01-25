事件
<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-table
        :data="page_event_list"
        size="small"
        empty-text="啥也没有"
        border
        :row-style="TableRowStyle"
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column label="对象">
          <template slot-scope="scoped">
            {{ scoped.row.involvedObject.kind }}:{{
              scoped.row.involvedObject.name
            }}
          </template>
        </el-table-column>
        <el-table-column label="来源">
          <template slot-scope="scoped">
            <span v-if="scoped.row.source.host === ''">
              {{ scoped.row.source.component }}
            </span>
            <span v-else>
              {{ scoped.row.source.component }}:{{ scoped.row.source.host }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="消息" prop="message"> </el-table-column>
        <el-table-column label="类型" prop="type"> </el-table-column>
        <el-table-column label="原因" prop="reason"> </el-table-column>
        <el-table-column label="时间">
          <template slot-scope="scoped">
            <!-- <span v-if="scoped.row.reason === 'Scheduled'">
              {{
                scoped.row.eventTime.seconds
                  | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
              }}
            </span>
            <span v-else>
              {{
                scoped.row.firstTimestamp.seconds
                  | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
              }}
            </span> -->
            {{
              scoped.row.firstTimestamp.seconds
                | parseTime("{y}-{m}-{d} {h}:{i}:{s}")
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60px">
          <template slot-scope="scoped">
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              @confirm="delete_event(scoped.row)"
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
        :total="event_list.length"
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
  sendSocketMessage,
  returnResponse,
  deleteSocketData,
} from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

export default {
  name: "Event",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  data() {
    return {
      currentPage: 1,
      event_list: [],
    };
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_event_list: function () {
      return this.event_list.slice(
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
      this.get_event_list(this.namespace);
    },
  },
  created() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_event_list(ns);
  },
  methods: {
    TableRowStyle({ row, rowIndex }) {
      let rowBackground = {};
      if (row.type.includes("Warning")) {
        rowBackground.background = "#F8C471";
        return rowBackground;
      }
    },
    get_event_list(ns) {
      const senddata = initSocketData(ns, "core-v1-Event", "list");
      sendSocketMessage(senddata, store);
    },
    delete_event(item) {
      let gvkObj = {
        group: "core",
        version: "v1",
        kind: "Event",
      };
      const delete_data = deleteSocketData(gvkObj, item);

      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(
        ns,
        "core-v1-Event",
        "delete",
        delete_data
      );
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
        const event_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(event_list);
        event_list.sort((itemA, itemB) => {
          return itemB.firstTimestamp.seconds - itemA.firstTimestamp.seconds;
        });
        this.event_list = [];
        for (let event of event_list) {
          this.event_list.push(event);
        }
      } else if (result.verb === "delete" && result.namespace === ns) {
        this.$message({
          type: "success",
          message: "删除成功",
        });
        this.get_event_list(ns);
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
