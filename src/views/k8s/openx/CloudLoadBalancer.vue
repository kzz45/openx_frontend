<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_alb"
        >新增</el-button
      >
      <el-table :data="alb_list" size="small" empty-text="啥也没有" border>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="名称" prop="metadata.name"></el-table-column>
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
              @click="update_alb(scoped.row)"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_alb(scoped.row)"
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

      <el-dialog
        :title="textMap[dialogStatus]"
        :visible.sync="alb_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="alb_obj_refs"
          :model="alb_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="dialog_tabs">
            <el-tab-pane label="基本信息" name="metadata">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="Name" prop="metadata.name">
                    <el-input v-model="alb_obj.metadata.name"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Namespace" prop="metadata.namespace">
                    <el-input
                      v-model="alb_obj.metadata.namespace"
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
                      v-for="tag in initAnnotations(
                        alb_obj.metadata.annotations
                      )"
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
                      v-for="tag in initAnnotations(alb_obj.metadata.labels)"
                      :key="tag.label"
                      @close="close_label(tag.label)"
                      closable
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>

            <el-tab-pane label="规格" name="spec">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="负责均衡ID" prop="spec.instance">
                    <el-input
                      v-model="alb_obj.spec.instance.value"
                    ></el-input> </el-form-item
                ></el-col>
                <el-col :span="12">
                  <el-form-item label="覆盖监听" prop="spec.overrideListeners">
                    <el-select v-model="alb_obj.spec.overrideListeners.value">
                      <el-option label="true" value="true"></el-option>
                      <el-option label="false" value="false"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="alb_dialog = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submit_alb"
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
import { mapGetters } from "vuex";
import { parseTime } from "@/utils";
import protoRoot from "@/proto/proto";
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
import { initSocketData, updateSocketData, sendSocketMessage } from "@/api/k8s";
import MetaDataTpl from "@/components/k8s/metadata";

const AlbObj = {
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
    instance: {
      key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id",
      value: "",
    },
    overrideListeners: {
      key: "service.beta.kubernetes.io/alicloud-loadbalancer-force-override-listeners",
      value: "",
    },
  },
};

export default {
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  components: {
    MetaDataTpl,
  },
  computed: {
    ...mapGetters(["message", "namespace", "isConnected"]),
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    // 切换 namspace
    namespace: function () {
      this.get_alb_list(this.namespace);
    },
    isConnected: function () {
      if (this.isConnected) {
        console.log("......isConnected......");
        const ns = localStorage.getItem("k8s_namespace");
        this.get_alb_list(ns);
      }
    },
  },
  created() {
    const ns = localStorage.getItem("k8s_namespace");
    this.get_alb_list(ns);
  },
  data() {
    return {
      textMap: {
        create_alb: "新增",
        update_alb: "编辑",
        create_annotation: "新增注解",
        update_annotation: "编辑注解",
        create_label: "新增标签",
        update_label: "编辑标签",
      },
      dialogStatus: "",
      alb_dialog: false,
      dialog_tabs: "metadata",
      kv_tag: {
        label: "",
        value: "",
      },
      kv_dialog: false,
      kv_dialog_status: "",
      alb_list: [],
      alb_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
        },
        spec: {
          instance: {
            key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id",
            value: "",
          },
          overrideListeners: {
            key: "service.beta.kubernetes.io/alicloud-loadbalancer-force-override-listeners",
            value: "",
          },
        },
      },
    };
  },
  methods: {
    create_alb() {
      this.alb_dialog = true;
      this.dialogStatus = "create_alb";
      this.alb_obj = Object.assign({}, AlbObj);
    },
    update_alb(row) {
      this.alb_dialog = true;
      this.dialogStatus = "create_alb";
      this.alb_obj = Object.assign({}, row);
    },
    delete_alb(row) {
      this.alb_obj = Object.assign({}, row);
      const ns = localStorage.getItem("k8s_namespace");
      const message = protoOpenx["v1"]["AliyunLoadBalancer"].create(
        this.alb_obj
      );
      const params = protoOpenx["v1"]["AliyunLoadBalancer"]
        .encode(message)
        .finish();
      const createdata = initSocketData(
        ns,
        "openx.neverdown.org-v1-AliyunLoadBalancer",
        "delete",
        params
      );
      sendSocketMessage(createdata, store);
      
    },
    submit_alb() {
      if (this.dialogStatus === "create_alb") {
        const ns = localStorage.getItem("k8s_namespace");
        // console.log(this.alb_obj, "====");
        const message = protoOpenx["v1"]["AliyunLoadBalancer"].create(
          this.alb_obj
        );
        const params = protoOpenx["v1"]["AliyunLoadBalancer"]
          .encode(message)
          .finish();
        const createdata = initSocketData(
          ns,
          "openx.neverdown.org-v1-AliyunLoadBalancer",
          "create",
          params
        );
        sendSocketMessage(createdata, store);
        this.alb_dialog = false;
        const senddata = initSocketData(
          ns,
          "openx.neverdown.org-v1-AliyunLoadBalancer",
          "list"
        );
        sendSocketMessage(senddata, store);
      } else if (this.dialogStatus === "update_alb") {
        //
      }
    },
    get_alb_list(ns) {
      const senddata = initSocketData(
        ns,
        "openx.neverdown.org-v1-AliyunLoadBalancer",
        "list"
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
      if (
        result.verb === "list" &&
        result.namespace === ns &&
        result.groupVersionKind.kind === "AliyunLoadBalancer"
      ) {
        const alb_list = protoOpenx["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(alb_list, "=====");
        alb_list.sort((itemA, itemB) => {
          return (
            itemB.metadata.creationTimestamp.seconds -
            itemA.metadata.creationTimestamp.seconds
          );
        });
        this.alb_list = [];
        for (let node of alb_list) {
          this.alb_list.push(node);
        }
      }
    },
    initAnnotations(ans) {
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
      const annotations = Object.assign({}, this.alb_obj.metadata.annotations);
      delete annotations[tag];
      this.alb_obj.metadata.annotations = annotations;
    },
    add_labels() {
      this.kv_dialog = true;
      this.kv_dialog_status = "create_label";
      this.kv_tag = Object.assign({}, "");
    },
    close_label(tag) {
      const labels = Object.assign({}, this.alb_obj.metadata.labels);
      delete labels[tag];
      this.alb_obj.metadata.labels = labels;
    },
    submit_kv() {
      if (this.kv_dialog_status === "create_annotation") {
        const addKey = this.kv_tag.label;
        const addValue = this.kv_tag.value;
        if (addKey === "" || addValue === "") {
          return;
        } else {
          this.alb_obj.metadata.annotations[addKey] = addValue;
        }
        this.kv_dialog = false;
      } else if (this.kv_dialog_status === "create_label") {
        const addKey = this.kv_tag.label;
        const addValue = this.kv_tag.value;
        if (addKey === "" || addValue === "") {
          return;
        } else {
          this.alb_obj.metadata.labels[addKey] = addValue;
        }
        this.kv_dialog = false;
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
