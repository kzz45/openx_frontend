<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_service"
        >新增</el-button
      >
      <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入YAML</el-button
          >
          <el-button type="info" size="small" icon="el-icon-copy-document"
            >拷贝</el-button
          >
          <el-button type="warning" size="small" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button type="danger" size="small" icon="el-icon-delete"
            >删除</el-button
          > -->
      <el-table
        :data="page_service_list"
        size="small"
        empty-text="啥也没有"
        border
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
        <el-table-column label="类型" prop="spec.type"></el-table-column>
        <el-table-column
          label="ClusterIP"
          prop="spec.clusterIP"
        ></el-table-column>
        <el-table-column label="端口">
          <template slot-scope="scoped">
            <el-tag
              v-for="(item, index) in scoped.row.spec.ports"
              :key="index"
              style="margin-left: 3px"
              >{{ item.port }}-->{{ item.targetPort.intVal }}/{{
                item.protocol
              }}</el-tag
            >
          </template>
        </el-table-column>
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
            <el-button
              type="warning"
              icon="el-icon-edit"
              size="small"
              @click="update_service(scoped.row)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="导出"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-top"
                size="small"
              ></el-button>
            </el-tooltip>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_service(scoped.row)"
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
        :total="service_list.length"
        layout="total, prev, pager, next"
        style="text-align: left; margin-top: 20px"
      >
      </el-pagination>

      <el-dialog
        title="服务"
        :visible.sync="service_dialog"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        top="5%"
        width="60%"
      >
        <el-tabs tab-position="top">
          <el-tab-pane label="基本信息">
            <MetaData></MetaData>
          </el-tab-pane>
          <el-tab-pane label="配置信息">
            <el-form
              ref="service_spec_form_refs"
              :model="service_spec_form"
              size="small"
              label-width="80px"
            >
              <el-row>
                <el-col :span="12">
                  <el-form-item label="类型">
                    <el-select
                      v-model="service_spec_form.svc_type"
                      placeholder=""
                    >
                      <el-option
                        label="ClusterIP"
                        value="ClusterIP"
                      ></el-option>
                      <el-option label="NodePort" value="NodePort"></el-option>
                      <el-option
                        label="LoadBalancer"
                        value="LoadBalancer"
                      ></el-option>
                      <el-option
                        label="ExternalName"
                        value="ExternalName"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="ClusterIP">
                    <el-input
                      v-model="service_spec_form.clusterip"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6"></el-col>
                <el-col :span="6"></el-col>
                <el-col :span="6"></el-col>
                <el-col :span="6"></el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="service_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_service"
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
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

import MetaData from "../components/metadata.vue";

const ServiceObj = {
  metadata: {
    name: "",
    namespace: "",
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
};

export default {
  name: "ServiceIngress",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaData,
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_service_list: function () {
      return this.service_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  mounted() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_service_list(ns);
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_service_list(this.namespace);
    },
  },
  data() {
    return {
      active_tab: "Service",
      currentPage: 1,
      service_list: [],
      service_dialog: false,
      service_spec_form: {},
    };
  },
  methods: {
    tab_click(tab) {
      if (tab.name === "Service") {
        //
      } else if (tab.name === "Ingress") {
        //
      }
    },
    create_service() {
      this.service_dialog = true;
    },
    update_service(row) {},
    delete_service(row) {},
    submit_service() {},
    get_service_list(ns) {
      const senddata = initSocketData(ns, "core-v1-Service", "list");
      sendSocketMessage(senddata, store);
    },
    // --------------------------------------------------
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
        result.groupVersionKind.kind === "Service"
      ) {
        const service_list = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(service_list);
        service_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.service_list = [];
        for (let svc of service_list) {
          this.service_list.push(svc);
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
