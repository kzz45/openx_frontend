<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs v-model="active_tab" @tab-click="tab_click">
        <!-- -------------------------------------------------- -->
        <el-tab-pane label="Deployment" name="Deployment">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="create_deployment"
            >新增</el-button
          >
          <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-top"
            >导出</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入YAML</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-top"
            >导出YAML</el-button
          >
          <el-button type="warning" size="small" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button type="danger" size="small" icon="el-icon-delete"
            >删除</el-button
          >
          <el-button type="info" size="small" icon="el-icon-copy-document"
            >拷贝</el-button
          > -->
          <el-table
            :data="page_deployment_list"
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
            <el-table-column label="状态">
              <template slot-scope="scoped">
                <div
                  v-if="
                    scoped.row.status.replicas ===
                    scoped.row.status.readyReplicas
                  "
                >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Replicas"
                    placement="top"
                  >
                    <el-tag type="success">{{
                      scoped.row.status.replicas
                    }}</el-tag>
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="ReadyReplicas"
                    placement="top"
                  >
                    <el-tag type="success">{{
                      scoped.row.status.readyReplicas
                    }}</el-tag>
                  </el-tooltip>
                </div>
                <div v-else>
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="Replicas"
                    placement="top"
                  >
                    <el-tag type="danger">{{
                      scoped.row.status.replicas
                    }}</el-tag></el-tooltip
                  >
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="ReadyReplicas"
                    placement="top"
                  >
                    <el-tag type="danger">{{
                      scoped.row.status.readyReplicas
                    }}</el-tag></el-tooltip
                  >
                </div>
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
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="update_deployment(scoped.row)"
                ></el-button>
                <el-popconfirm
                  title="确定删除吗？"
                  confirm-button-text="确定"
                  cancel-button-text="不了"
                  style="margin-left: 10px"
                  @confirm="delete_deployment(scoped.row)"
                  @cancel="cancel_delete"
                >
                  <el-button
                    slot="reference"
                    type="danger"
                    icon="el-icon-delete"
                    size="small"
                  ></el-button>
                </el-popconfirm>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="更多"
                  placement="top"
                  style="margin-left: 10px"
                >
                  <el-dropdown
                    trigger="hover"
                    @command="
                      (command) => {
                        deployment_command(command, scoped.row);
                      }
                    "
                  >
                    <el-button type="warning" icon="el-icon-menu" size="small">
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        command="export"
                        icon="el-icon-c-scale-to-original"
                        style="color: #f8c471"
                        >伸缩</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="export"
                        icon="el-icon-top"
                        style="color: #409eff"
                        >导出</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="export_yaml"
                        icon="el-icon-document"
                        style="color: #67c23a"
                        >YAML</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="export_yaml"
                        icon="el-icon-refresh"
                        style="color: #ec7063"
                        >重启</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            background
            :page-size="10"
            :current-page.sync="currentPage"
            :total="deployment_list.length"
            layout="total, prev, pager, next"
            style="text-align: left; margin-top: 20px"
          >
          </el-pagination>
        </el-tab-pane>
        <!-- -------------------------------------------------- -->
      </el-tabs>
    </el-card>

    <!-- -------------------------------------------------- -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="deployment_dialog"
      :show-close="false"
      scrollable
      top="2%"
      width="60%"
    >
      <el-form
        ref="deployment_obj_refs"
        :model="deployment_obj"
        size="small"
        label-width="80px"
      >
        <el-tabs tab-position="top" v-model="deployment_active_tab">
          <el-tab-pane label="基础信息" name="metadata">
            <MetaData :metadata_form="deployment_obj.metadata"></MetaData>
            <el-row>
              <el-col :span="12">
                <el-form-item label="副本数" prop="spec.replicas">
                  <el-input-number
                    v-model="deployment_obj.spec.replicas"
                    :min="0"
                    style="width: 200px"
                  ></el-input-number>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择标签" prop="spec.selector.matchLabels">
                  <el-button
                    size="small"
                    icon="el-icon-plus"
                    @click="add_matchLabels"
                  ></el-button>
                  <el-tooltip placement="right" effect="light">
                    <div
                      slot="content"
                      v-for="(item, index) in matchLabels_list"
                      :key="index"
                    >
                      <el-tag size="mini" type="info">{{ item.key }}</el-tag>
                      <el-tag size="mini" type="success">{{
                        item.value
                      }}</el-tag>
                      <br />
                    </div>
                    <el-button
                      type="info"
                      icon="el-icon-collection-tag"
                      size="small"
                    ></el-button>
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="容器信息">
            <el-row>
              <el-tag
                v-for="(container, index) in deployment_obj.spec.template.spec
                  .containers"
                :key="index"
                :disable-transitions="false"
                type="primary"
                effect="dark"
                closable
                style="margin-right: 10px; margin-bottom: 10px"
                @close="container_tag_close(container)"
                @click="container_tag_click(container, index)"
              >
                {{ container.name }}
              </el-tag>
            </el-row>

            <el-input
              class="input-new-tag"
              v-if="container_name_visible"
              v-model="container_name"
              ref="saveTagInput"
              size="small"
              style="margin-right: 10px"
              @keyup.enter.native="add_container"
              @blur="add_container"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              icon="el-icon-plus"
              @click="container_name_input"
              >新增容器</el-button
            >
            <el-divider content-position="right">Container</el-divider>

            <Container
              v-if="deployment_obj.spec.template.spec.containers.length > 0"
              :container_form="
                deployment_obj.spec.template.spec.containers[
                  this.container_index
                ]
              "
            ></Container>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="deployment_dialog = false"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="submit_deployment"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <LabelDialog
      :title="matchLabels_title"
      :visible="matchLabels_visible"
      :key_value_list="matchLabels_key_value_list"
      @delete_kv="matchLabels_delete_kv"
      @cancel_delete_kv="matchLabels_cancel_delete_kv"
      @dynamic_kv="matchLabels_dynamic_kv"
      @cancel_submit_kv="matchLabels_cancel_submit_kv"
      @submit_kv="matchLabels_submit_kv"
    ></LabelDialog>
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

import MetaData from "../components/metadata";
import Container from "../components/container";
import LabelDialog from "../components/labelDialog";

const DeploymentObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
    creationTimestamp: {
      seconds: 0,
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {},
    },
    template: {
      metadata: {
        labels: {},
      },
      spec: {
        volumes: [],
        containers: [],
        nodeSelector: {},
        serviceAccountName: "",
        imagePullSecrets: [],
        affinity: [],
        tolerations: [],
      },
    },
  },
};

const ContainerObj = {
  name: "",
  image: {},
  command: [],
  args: [],
  resources: {
    limits: {
      cpu: "",
      memory: "",
    },
    requests: {
      cpu: "",
      memory: "",
    },
  },
};
export default {
  name: "appsv1",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaData,
    Container,
    LabelDialog,
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
    page_deployment_list: function () {
      return this.deployment_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  watch: {
    message: {
      handler() {
        this.socket_onmessage(this.message);
      },
    },
    namespace: function () {
      this.get_deployment_list(this.namespace);
    },
  },
  data() {
    return {
      textMap: {
        create_deployment: "新增Deploy",
        update_deployment: "编辑Deploy",
      },
      dialogStatus: "",
      active_tab: "Deployment",
      dialogS: "",
      currentPage: 1,
      deployment_dialog: false,
      deployment_active_tab: "metadata",
      container_name: "",
      container_index: 0,
      container_name_visible: false,
      deployment_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
          creationTimestamp: {
            seconds: 0,
          },
        },
        spec: {
          replicas: 1,
          selector: {
            matchLabels: {},
          },
          template: {
            metadata: {
              labels: {},
            },
            spec: {
              volumes: [],
              containers: [],
              nodeSelector: {},
              serviceAccountName: "",
              imagePullSecrets: [],
              affinity: [],
              tolerations: [],
            },
          },
        },
      },
      matchLabels_title: "匹配标签",
      matchLabels_visible: false,
      matchLabels_key_value_list: [],
      matchLabels_list: [],
      deployment_list: [],
      statefulset_list: [],
      daemonset_list: [],
    };
  },
  mounted() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_deployment_list(ns);
  },
  methods: {
    tab_click(tab) {
      if (tab.name === "Deployment") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_deployment_list(ns);
      } else if (tab.name === "StatefulSet") {
        let ns = localStorage.getItem("k8s_namespace");
        this.get_statefulset_list(ns);
      } else if (tab.name === "DaemonSet") {
        this.get_daemonset_list();
      }
    },
    container_tag_close(tag) {
      this.deployment_obj.spec.template.spec.containers.splice(
        this.deployment_obj.spec.template.spec.containers.indexOf(tag),
        1
      );
    },
    container_tag_click(tag, index) {
      // console.log(tag, index);
      this.container_index = index;
    },
    add_container() {
      let container_name = this.container_name;
      let inputIndex = this.container_index;
      if (container_name) {
        // let default_container_obj = {
        //   index: inputIndex,
        //   name: container_name,
        // };
        let default_container_obj = Object.assign({}, ContainerObj);
        default_container_obj.name = container_name;
        if (
          this.deployment_obj.spec.template.spec.containers.findIndex(
            (object) => object.name === default_container_obj.name
          ) === -1
        ) {
          this.deployment_obj.spec.template.spec.containers.push(
            default_container_obj
          );
        } else {
          this.$message({ type: "warning", message: "名称重复" });
        }
      }
      this.container_name_visible = false;
      this.container_name = "";
    },
    container_name_input() {
      this.container_name_visible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    add_matchLabels() {
      this.matchLabels_visible = true;
      this.matchLabels_key_value_list = [{ isAdd: true, key: "", value: "" }];
    },
    matchLabels_delete_kv(row) {
      this.matchLabels_key_value_list = this.matchLabels_key_value_list.filter(
        (item) => item !== row
      );
    },
    matchLabels_cancel_delete_kv() {
      this.$message({
        type: "warning",
        message: "你考虑的很全面",
      });
    },
    matchLabels_dynamic_kv(row) {
      if (row.isAdd) {
        this.matchLabels_key_value_list.slice(-1)[0].isAdd = false;
        this.matchLabels_key_value_list.push({
          isAdd: true,
          key: "",
          value: "",
        });
      } else {
        this.matchLabels_key_value_list =
          this.matchLabels_key_value_list.filter((item) => item !== row);
      }
    },
    matchLabels_cancel_submit_kv() {
      this.matchLabels_visible = false;
    },
    matchLabels_submit_kv() {
      this.matchLabels_visible = false;
      this.matchLabels_list = this.matchLabels_list.concat(
        this.matchLabels_key_value_list
      );
    },
    create_deployment() {
      this.dialogStatus = "create_deployment";
      this.deployment_dialog = true;
      this.deployment_active_tab = "metadata";
      // this.deployment_obj = Object.assign({}, DeploymentObj);
      this.deployment_obj = DeploymentObj;
      this.matchLabels_list = [];
    },
    update_deployment(row) {
      this.dialogStatus = "update_deployment";
      this.deployment_dialog = true;
      this.deployment_active_tab = "metadata";
      this.deployment_obj = Object.assign({}, row);
      this.matchLabels_list = [];
      for (const [key, value] of Object.entries(
        this.deployment_obj.spec.selector.matchLabels
      )) {
        this.matchLabels_list.push({
          key: key,
          value: value,
        });
      }
    },
    delete_deployment(row) {},
    submit_deployment() {
      if (this.dialogStatus === "create_deployment") {
        console.log(this.deployment_obj);
      } else if (this.dialogStatus === "update_deployment") {
        //
      }
    },
    deployment_command() {},
    get_deployment_list(ns) {
      const senddata = initSocketData(ns, "apps-v1-Deployment", "list");
      sendSocketMessage(senddata, store);
    },
    get_statefulset_list(ns) {
      const senddata = initSocketData(ns, "apps-v1-StatefulSet", "list");
      sendSocketMessage(senddata, store);
    },
    get_daemonset_list(ns) {
      const senddata = initSocketData(ns, "apps-v1-DaemonSet", "list");
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      const ns = localStorage.getItem("k8s_namespace");
      const result = protoRequest.Response.decode(msg);
      if (result.code === 1) {
        const err_msg = String.fromCharCode.apply(null, result.raw);
        this.$message({
          type: "error",
          message: err_msg,
        });
      }
      // console.log("==============", result);
      if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "Deployment"
      ) {
        const deployment_list = protoApi["apps"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(deployment_list);
        deployment_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.deployment_list = [];
        for (let node of deployment_list) {
          this.deployment_list.push(node);
        }
      } else if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "StatefulSet"
      ) {
        const statefulset_list = protoApi["apps"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(statefulset_list);
        statefulset_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.statefulset_list = [];
        for (let node of statefulset_list) {
          this.statefulset_list.push(node);
        }
      } else if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "DaemonSet"
      ) {
        const daemonset_list = protoApi["apps"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(daemonset_list);
        daemonset_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.daemonset_list = [];
        for (let node of daemonset_list) {
          this.daemonset_list.push(node);
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

.el-dialog__body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
