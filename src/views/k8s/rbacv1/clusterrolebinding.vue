<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-circle-plus"
        @click="create_clusterrolebinding"
        >新增</el-button
      >

      <el-table
        :data="page_clusterrolebinding_list"
        size="mini"
        empty-text="啥也没有"
        border
      >
        <el-table-column type="selection" width="40"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"> </el-table-column>
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

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="clusterrolebinding_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="clusterrolebinding_obj_refs"
          :model="clusterrolebinding_obj"
          size="small"
          label-width="80px"
        >
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="clusterrolebinding_dialog = false"
            >取 消</el-button
          >
          <el-button
            type="primary"
            size="small"
            @click="submit_clusterrolebinding"
            >确 定</el-button
          >
        </span>
      </el-dialog>
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

const CRBGvk = "rbac.authorization.k8s.io-v1-ClusterRoleBinding";

export default {
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_clusterrolebinding_list: function () {
      this.clusterrolebinding_list.sort((itemL, itemR) => {
        const itemLTime = itemL.metadata.creationTimestamp.seconds;
        const itemRTime = itemR.metadata.creationTimestamp.seconds;
        return itemRTime - itemLTime;
      });
      return this.clusterrolebinding_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  data() {
    return {
      textMap: {
        create_clusterrolebinding: "新增",
        update_clusterrolebinding: "编辑",
      },
      clusterrolebinding_dialog: false,
      dialogStatus: "",
      currentPage: 1,
      clusterrolebinding_list: [],
      clusterrolebinding_obj: {},
    };
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_clusterrolebinding_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "rbac.authorization.k8s.io",
        version: "v1",
        kind: "ClusterRoleBinding",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_clusterrolebinding_list
      );
      if (result_list) {
        // console.log(result_list);
        this.clusterrolebinding_list = result_list;
      }
    },
    namespace: function () {
      this.get_clusterrolebinding_list();
    },
  },
  created() {
    this.get_clusterrolebinding_list();
  },
  methods: {
    create_clusterrolebinding() {
      this.clusterrolebinding_dialog = true;
      this.dialogStatus = "create_clusterrolebinding";
    },
    update_clusterrolebinding() {
      this.clusterrolebinding_dialog = true;
      this.dialogStatus = "update_clusterrolebinding";
    },
    delete_clusterrolebinding() {},
    get_clusterrolebinding_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, CRBGvk, "list");
      sendSocketMessage(senddata, store);
    },
    submit_clusterrolebinding() {},
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.clusterrolebinding_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.clusterrolebinding_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.clusterrolebinding_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.clusterrolebinding_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.clusterrolebinding_list.splice(modIndex, 1);
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
