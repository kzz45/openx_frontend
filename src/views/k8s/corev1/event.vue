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
  updateSocketData,
  deleteSocketData,
  sendSocketMessage,
  returnResponse,
  getGvkGroup,
  encodeify,
  binaryToStr,
} from "@/api/k8s";

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
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_event_list: function () {
      return this.event_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_event_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Event",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_event_list
      );
      if (result_list) {
        this.event_list = result_list;
      }
    },
    namespace: function () {
      this.get_event_list();
    },
  },
  created() {
    this.get_event_list();
  },
  methods: {
    TableRowStyle({ row, rowIndex }) {
      let rowBackground = {};
      if (row.type.includes("Warning")) {
        rowBackground.background = "#F8C471";
        return rowBackground;
      }
    },
    get_event_list() {
      const ns = localStorage.getItem("k8s_namespace");
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
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.event_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.event_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.event_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.event_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.event_list.splice(modIndex, 1);
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
