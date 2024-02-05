事件
<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_namespace"
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
        <el-table-column label="操作" width="80px;">
          <template slot-scope="scoped">
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

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="namespace_dialog"
        width="60%"
      >
        <el-form
          ref="namespace_obj_refs"
          :model="namespace_obj"
          size="small"
          label-width="100px"
        >
          <MetaDataTpl
            ref="metadatatpl"
            :metadata="namespace_obj.metadata"
          ></MetaDataTpl>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="namespace_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_namespace"
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
import { Notification } from "element-ui";
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
import MetaDataTpl from "@/components/k8s/metadata.vue";

const Namespacegvk = "core-v1-Namespace";

export default {
  name: "Namespace",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaDataTpl,
  },
  data() {
    return {
      textMap: {
        create_namespace: "新增",
        update_namespace: "编辑",
      },
      dialogStatus: "",
      currentPage: 1,
      namespace_list: [],
      namespace_dialog: false,
      namespace_obj: {
        metadata: {
          name: "",
          namespace: localStorage.getItem("k8s_namespace"),
          annotations: {},
          labels: {},
        },
        spec: {
          finalizers: [],
        },
      },
    };
  },
  computed: {
    ...mapGetters(["message", "isConnected"]),
    page_namespace_list: function () {
      this.namespace_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.namespace_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },

  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_namespace_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Namespace",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_namespace_list
      );
      if (result_list) {
        this.namespace_list = result_list;
      }
    },
  },
  mounted() {
    this.get_namespace_list();
  },
  methods: {
    create_namespace() {
      this.namespace_dialog = true;
      this.dialogStatus = "create_namespace";
    },
    delete_namespace(row) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkGroup = getGvkGroup(Namespacegvk);
      const params = deleteSocketData(gvkGroup, row);
      const delete_data = initSocketData(ns, Namespacegvk, "delete", params);
      sendSocketMessage(delete_data, store);
    },
    submit_namespace() {
      if (this.dialogStatus === "create_namespace") {
        // console.log(this.namespace_obj, "===========");
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "Namespace",
        };
        const item = cloneDeep(this.namespace_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const create_data = initSocketData(ns, Namespacegvk, "create", param);
        sendSocketMessage(create_data, store);
        this.namespace_dialog = false;
      }
    },
    get_namespace_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, Namespacegvk, "list");
      sendSocketMessage(senddata, store);
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.namespace_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.namespace_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.namespace_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.namespace_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.namespace_list.splice(modIndex, 1);
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
