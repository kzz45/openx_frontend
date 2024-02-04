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
              >{{ item.port }}:{{ item.targetPort.intVal }}/{{
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
              type="primary"
              icon="el-icon-edit"
              size="small"
              @click="update_service(scoped.row)"
            ></el-button>
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
            <el-tooltip
              class="item"
              effect="dark"
              content="更多"
              placement="top"
              style="margin-left: 10px"
            >
              <el-dropdown
                trigger="click"
                @command="
                  (command) => {
                    service_command(command, scoped.row);
                  }
                "
              >
                <el-button type="warning" icon="el-icon-menu" size="small">
                </el-button>
                <el-dropdown-menu slot="dropdown">
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
                    >导出YAML</el-dropdown-item
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
        :total="service_list.length"
        layout="total, prev, pager, next"
        style="text-align: left; margin-top: 20px"
      >
      </el-pagination>

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="service_dialog"
        top="5%"
        width="60%"
      >
        <el-form
          ref="service_obj_refs"
          :model="service_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="dialog_tabs">
            <el-tab-pane label="基本信息" name="metadata">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="Name" prop="metadata.name">
                    <el-input v-model="service_obj.metadata.name"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Namespace" prop="metadata.namespace">
                    <el-input
                      v-model="service_obj.metadata.namespace"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="注解" prop="metadata.annotations">
                    <el-button
                      size="small"
                      icon="el-icon-plus"
                      @click="add_annotations"
                    ></el-button>
                    <el-tag
                      v-for="tag in showKV(service_obj.metadata.annotations)"
                      :key="tag.label"
                      closable
                      @close="close_annotation(tag.label)"
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="标签" prop="metadata.labels">
                    <el-button
                      size="small"
                      icon="el-icon-plus"
                      @click="add_labels"
                    ></el-button>
                    <el-tag
                      v-for="tag in showKV(service_obj.metadata.labels)"
                      :key="tag.label"
                      @close="close_label(tag.label)"
                      closable
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="配置信息" name="spec">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="类型">
                    <el-select v-model="service_obj.spec.type" placeholder="">
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
                  <el-form-item label="选择器" prop="spec.selector">
                    <el-button
                      size="small"
                      icon="el-icon-plus"
                      @click="add_selector"
                    ></el-button>
                    <el-tag
                      v-for="tag in showKV(service_obj.spec.selector)"
                      :key="tag.label"
                      closable
                      @close="close_selector(tag.label)"
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="端口" prop="ports">
                    <el-tooltip
                      class="item"
                      effect="dark"
                      content="添加端口"
                      placement="top"
                    >
                      <el-button
                        size="small"
                        icon="el-icon-plus"
                        @click="add_service_ports"
                      ></el-button>
                    </el-tooltip>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="service_obj.spec.ports.length > 0">
                <el-form-item>
                  <el-table :data="service_obj.spec.ports" size="mini" border>
                    <el-table-column label="名称" prop="name">
                      <template slot-scope="scoped">
                        <el-input
                          v-if="scoped.row.isSet"
                          v-model="scoped.row.name"
                          size="mini"
                        ></el-input>
                        <el-input
                          v-else
                          v-model="scoped.row.name"
                          size="mini"
                          disabled
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="协议" prop="protocol">
                      <template slot-scope="scoped">
                        <el-input
                          v-if="scoped.row.isSet"
                          v-model="scoped.row.protocol"
                          size="mini"
                        ></el-input>
                        <el-input
                          v-else
                          v-model="scoped.row.protocol"
                          size="mini"
                          disabled
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="端口" prop="port">
                      <template slot-scope="scoped">
                        <el-input
                          v-if="scoped.row.isSet"
                          v-model="scoped.row.port"
                          size="mini"
                        ></el-input>
                        <el-input
                          v-else
                          v-model="scoped.row.port"
                          size="mini"
                          disabled
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="目标端口" prop="targetPort">
                      <template slot-scope="scoped">
                        <el-input
                          v-if="scoped.row.isSet"
                          v-model="scoped.row.targetPort.intVal"
                          size="mini"
                        ></el-input>
                        <el-input
                          v-else
                          v-model="scoped.row.targetPort.intVal"
                          size="mini"
                          disabled
                        ></el-input>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120px">
                      <template slot-scope="scoped">
                        <el-button
                          type="primary"
                          size="mini"
                          :icon="
                            scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                          "
                          @click="
                            service_port_edit(scoped.row, scoped.row.isSet)
                          "
                        ></el-button>
                        <el-button
                          v-if="!scoped.row.isSet"
                          type="danger"
                          icon="el-icon-delete"
                          size="mini"
                          @click="
                            service_port_del(
                              service_obj.spec.ports,
                              scoped.$index
                            )
                          "
                        ></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form-item>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="service_dialog = false"
            >取 消</el-button
          >
          <el-button type="primary" size="small" @click="submit_service"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <el-dialog
        :title="textMap[kv_dialog_status]"
        :visible.sync="kv_dialog"
        append-to-body
      >
        <el-form size="small">
          <el-row>
            <el-col :span="12">
              <el-form-item label="label">
                <el-input v-model="kv_tag.label"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="value">
                <el-input v-model="kv_tag.value"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="kv_dialog = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submit_kv"
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
import json2yaml from "json2yaml";
import { saveAs } from "file-saver";
import { Notification } from "element-ui";
import {
  initSocketData,
  updateSocketData,
  sendSocketMessage,
  returnResponse,
  encodeify,
  binaryToStr,
} from "@/api/k8s";

const MetadataObj = {
  name: "",
  namespace: localStorage.getItem("k8s_namespace") || "",
  labels: {},
  annotations: {},
};

const ServiceObj = {
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
    selector: {},
    type: "",
    clusterIP: "",
    ports: [],
  },
};

export default {
  name: "ServiceIngress",
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },

  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
    page_service_list: function () {
      return this.service_list.slice(
        (this.currentPage - 1) * 10,
        this.currentPage * 10
      );
    },
  },
  created() {
    this.get_service_list();
  },
  mounted() {
    this.get_service_list();
  },
  watch: {
    isConnected: function (newVal) {
      if (newVal) {
        this.get_service_list();
      }
    },
    message: function (newMsg) {
      const ns = localStorage.getItem("k8s_namespace");
      const gvkObj = {
        group: "core",
        version: "v1",
        kind: "Service",
      };
      const result_list = returnResponse(
        newMsg,
        ns,
        gvkObj,
        this.updateWatch,
        this.get_service_list
      );
      if (result_list) {
        this.service_list = result_list;
      }
    },
    namespace: function () {
      this.get_service_list();
    },
  },
  data() {
    return {
      active_tab: "Service",
      textMap: {
        create_service: "新增服务",
        update_service: "编辑服务",
        create_annotation: "新增注解",
        update_annotation: "编辑注解",
        create_label: "新增标签",
        update_label: "编辑标签",
        create_selector: "新增选择器",
        update_selector: "编辑选择器",
      },
      dialogStatus: "",
      dialog_tabs: "metadata",
      currentPage: 1,
      service_list: [],
      service_dialog: false,
      kv_tag: {
        label: "",
        value: "",
      },
      kv_dialog: false,
      kv_dialog_status: "",
      service_obj: {
        metadata: {
          name: "",
          namespace: localStorage.getItem("k8s_namespace"),
          annotations: {},
          labels: {},
        },
        spec: {
          selector: {},
          type: "",
          clusterIP: "",
          ports: [],
        },
      },
    };
  },
  methods: {
    showKV(ans) {
      let tags = [];
      for (let key in ans) {
        tags.push({
          label: key,
          value: ans[key],
        });
      }
      return tags;
    },
    add_annotations() {
      this.kv_dialog = true;
      this.kv_dialog_status = "create_annotation";
      this.kv_tag = Object.assign({}, "");
    },
    close_annotation(tag) {
      const annotations = Object.assign(
        {},
        this.service_obj.metadata.annotations
      );
      delete annotations[tag];
      this.service_obj.metadata.annotations = annotations;
    },
    add_labels() {
      this.kv_dialog = true;
      this.kv_dialog_status = "create_label";
      this.kv_tag = Object.assign({}, "");
    },
    close_label(tag) {
      const labels = Object.assign({}, this.service_obj.metadata.labels);
      delete labels[tag];
      this.service_obj.metadata.labels = labels;
    },
    add_selector() {
      this.kv_dialog = true;
      this.kv_dialog_status = "create_selector";
      this.kv_tag = Object.assign({}, "");
    },
    close_selector(tag) {
      const selector = Object.assign({}, this.service_obj.spec.selector);
      delete selector[tag];
      this.service_obj.spec.selector = selector;
    },
    submit_kv() {
      if (this.kv_dialog_status === "create_annotation") {
        const addKey = this.kv_tag.label;
        const addValue = this.kv_tag.value;
        if (addKey === "" || addValue === "") {
          return;
        } else {
          this.service_obj.metadata.annotations[addKey] = addValue;
        }
        this.kv_dialog = false;
      } else if (this.kv_dialog_status === "create_label") {
        const addKey = this.kv_tag.label;
        const addValue = this.kv_tag.value;
        if (addKey === "" || addValue === "") {
          return;
        } else {
          this.service_obj.metadata.labels[addKey] = addValue;
        }
        this.kv_dialog = false;
      } else if (this.kv_dialog_status === "create_selector") {
        const addKey = this.kv_tag.label;
        const addValue = this.kv_tag.value;
        if (addKey === "" || addValue === "") {
          return;
        } else {
          this.service_obj.spec.selector[addKey] = addValue;
        }
        this.kv_dialog = false;
      }
    },
    add_service_ports() {
      this.service_obj.spec.ports.push({
        isSet: false,
        name: "",
        port: 80,
        protocol: "TCP",
        targetPort: {
          intVal: 80,
        },
      });
    },
    service_port_edit(row, isSet) {
      row.isSet = !isSet;
    },
    service_port_del(allData, index) {
      allData.splice(index, 1);
    },
    // --------------------------------------------------
    create_service() {
      this.service_dialog = true;
      this.dialogStatus = "create_service";
      this.service_obj.metadata = Object.assign({}, MetadataObj);
      this.service_obj.spec.ports = [];
      this.service_obj.spec.selector = Object.assign({}, "");
    },
    update_service(row) {
      this.service_dialog = true;
      this.dialogStatus = "update_service";
      this.service_obj = Object.assign({}, row);
      const changePort = [];
      for (const port of this.service_obj.spec.ports) {
        const temp = Object.assign({}, port);
        temp.isSet = false;
        changePort.push(temp);
      }
      this.service_obj.spec.ports = Object.assign([], changePort);
    },
    delete_service(row) {},
    service_command(command, row) {
      if (command === "export") {
        this.export_item(row);
      } else if (command === "export_yaml") {
        this.export_yaml(row);
      }
    },
    export_item(item) {
      const cloneItem = cloneDeep(item);
      let initItem = ServiceObj;

      if (initItem.metadata) {
        for (let metaIndex in initItem.metadata) {
          initItem.metadata[metaIndex] = cloneDeep(
            cloneItem.metadata[metaIndex]
          );
        }
      }
      if (initItem.spec) {
        for (let metaIndex in initItem.spec) {
          initItem.spec[metaIndex] = cloneDeep(cloneItem.spec[metaIndex]);
        }
      } else {
        initItem = cloneItem;
      }
      delete initItem.metadata.creationTimestamp;

      let gvkObj = {
        group: "core",
        version: "v1",
        kind: "Service",
      };
      const encodeItem = encodeify(gvkObj, initItem);
      localStorage.setItem("core-v1-Service", binaryToStr(encodeItem));
      Notification({
        title: "导出成功",
        message: "success",
        type: "success",
        duration: 3000,
      });
    },
    export_yaml(item) {
      const nsGvk = "core-v1-Service";
      const gvkArr = nsGvk.split("-");
      const cloneItem = cloneDeep(item);
      let fileName = item.metadata?.name || "";
      let avk = {
        apiVersion: `${gvkArr[0]}/${gvkArr[1]}`,
        kind: `${gvkArr[2]}`,
      };
      const yamlData = json2yaml.stringify(Object.assign(avk, cloneItem));
      const str = new Blob([yamlData], { type: "text/plain;charset=utf-8" });
      saveAs(str, nsGvk + "-" + fileName + ".yaml");
      Notification({
        title: "导出成功",
        message: "success",
        type: "success",
        duration: 3000,
      });
    },
    submit_service() {
      if (this.dialogStatus === "create_service") {
        // console.log(this.service_obj, "======");
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "Service",
        };
        const item = cloneDeep(this.service_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const create_data = initSocketData(
          ns,
          "core-v1-Service",
          "create",
          param
        );
        sendSocketMessage(create_data, store);
        this.service_dialog = false;
      } else if (this.dialogStatus === "update_service") {
        // console.log(this.service_obj, "======");
        const gvkObj = {
          group: "core",
          version: "v1",
          kind: "Service",
        };
        const item = cloneDeep(this.service_obj);
        const param = updateSocketData(gvkObj, item);
        const ns = localStorage.getItem("k8s_namespace");
        const update_data = initSocketData(
          ns,
          "core-v1-Service",
          "update",
          param
        );
        sendSocketMessage(update_data, store);
        this.service_dialog = false;
      }
    },
    get_service_list() {
      let ns = localStorage.getItem("k8s_namespace");
      const senddata = initSocketData(ns, "core-v1-Service", "list");
      sendSocketMessage(senddata, store);
    },
    updateWatch(types, updateRaw) {
      if (types === "ADDED") {
        this.service_list.unshift(updateRaw);
      } else if (types === "MODIFIED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.service_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.service_list[modIndex] = updateRaw;
        }
      } else if (types === "DELETED") {
        const modName = updateRaw.metadata.name;
        const modIndex = this.service_list.findIndex((ser) => {
          return ser.metadata.name === modName;
        });
        if (modIndex >= 0) {
          this.service_list.splice(modIndex, 1);
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
