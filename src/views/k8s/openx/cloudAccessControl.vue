<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="create_acl"
        >新增</el-button
      >
      <el-table :data="acl_list" size="small" empty-text="啥也没有" border>
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
              @click="update_acl(scoped.row)"
            ></el-button>
            <el-popconfirm
              title="确定删除吗？"
              confirm-button-text="确定"
              cancel-button-text="不了"
              style="margin-left: 10px"
              @confirm="delete_acl(scoped.row)"
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
        :visible.sync="acl_dialog"
        scrollable
        width="60%"
      >
        <el-form
          ref="acl_obj_refs"
          :model="acl_obj"
          size="small"
          label-width="100px"
        >
          <el-tabs v-model="dialog_tabs">
            <el-tab-pane label="Metadata" name="metadata">
              <MetadataTpl ref="metadatatpl"></MetadataTpl>
              <!-- <el-row>
                <el-col :span="12">
                  <el-form-item label="Name" prop="metadata.name">
                    <el-input v-model="acl_obj.metadata.name"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Namespace" prop="metadata.namespace">
                    <el-input
                      v-model="acl_obj.metadata.namespace"
                      disabled
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="注解" prop="metadata.annotations">
                    <el-button size="small" icon="el-icon-plus"></el-button>
                    <el-tag
                      v-for="tag in acl_obj.metadata.annotations"
                      :key="tag.label"
                      closable
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="标签" prop="metadata.labels">
                    <el-button size="small" icon="el-icon-plus"></el-button>
                    <el-tag
                      v-for="tag in acl_obj.metadata.labels"
                      :key="tag.label"
                      closable
                      >{{ tag.label }}:{{ tag.value }}</el-tag
                    >
                  </el-form-item>
                </el-col>
              </el-row> -->
            </el-tab-pane>
            <el-tab-pane label="Spec" name="spec">
              <el-row>
                <el-col :span="12">
                  <el-form-item label="instance" prop="instance">
                    <el-input
                      v-model="acl_obj.spec.instance.value"
                    ></el-input> </el-form-item
                ></el-col>
                <el-col :span="12">
                  <el-form-item label="status" prop="status">
                    <el-input v-model="acl_obj.spec.status.value"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="type" prop="type">
                    <el-input v-model="acl_obj.spec.type.value"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="acl_dialog = false">取 消</el-button>
          <el-button type="primary" size="small" @click="submit_acl"
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
import { Notification } from "element-ui";
import protoRoot from "@/proto/proto";
const protoOpenx = protoRoot.github.com.kzz45.discovery.pkg.apis.openx;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
import { initSocketData, updateSocketData, sendSocketMessage } from "@/api/k8s";
import { binaryToStr } from "@/views/k8s/utils/utils";

import MetadataTpl from "@/components/k8s/metadata";

const AclObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
  },
  spec: {
    instance: {
      key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-id",
      value: "",
    },
    status: {
      key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-status",
      value: "",
    },
    type: {
      key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-type",
      value: "",
    },
  },
};

export default {
  components: {
    MetadataTpl,
  },
  filters: {
    parseTime(time, cFormat) {
      return parseTime(time, cFormat);
    },
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_acl_list(this.namespace);
    },
  },
  created() {
    const ns = localStorage.getItem("k8s_namespace");
    this.get_acl_list(ns);
  },
  data() {
    return {
      textMap: {
        create_acl: "新增",
        update_acl: "编辑",
      },
      dialogStatus: "",
      acl_dialog: false,
      acl_list: [],
      acl_obj: {
        metadata: {
          name: "",
          namespace: "",
          annotations: {},
          labels: {},
        },
        spec: {
          instance: {
            key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-id",
            value: "",
          },
          status: {
            key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-status",
            value: "",
          },
          type: {
            key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-acl-type",
            value: "",
          },
        },
      },
      dialog_tabs: "metadata",
    };
  },
  methods: {
    create_acl() {
      this.acl_dialog = true;
      this.dialogStatus = "create_acl";
      this.acl_obj = Object.assign({}, AclObj);
    },
    update_acl(row) {
      this.acl_dialog = true;
      this.dialogStatus = "create_acl";
      this.acl_obj = Object.assign({}, row);
    },
    delete_acl(row) {
      this.acl_obj = Object.assign({}, row);
      // console.log(this.acl_obj, "=====");
      const ns = localStorage.getItem("k8s_namespace");
      const message = protoOpenx["v1"]["AliyunAccessControl"].create(
        this.acl_obj
      );
      const params = protoOpenx["v1"]["AliyunAccessControl"]
        .encode(message)
        .finish();
      const delete_data = initSocketData(
        ns,
        "openx.neverdown.org-v1-AliyunAccessControl",
        "delete",
        params
      );
      sendSocketMessage(delete_data, store);
    },
    submit_acl() {
      if (this.dialogStatus === "create_acl") {
        const ns = localStorage.getItem("k8s_namespace");
        this.acl_obj.metadata = this.$refs.metadatatpl.metadata;
        const message = protoOpenx["v1"]["AliyunAccessControl"].create(
          this.acl_obj
        );
        const params = protoOpenx["v1"]["AliyunAccessControl"]
          .encode(message)
          .finish();
        const createdata = initSocketData(
          ns,
          "openx.neverdown.org-v1-AliyunAccessControl",
          "create",
          params
        );
        sendSocketMessage(createdata, store);
        this.acl_dialog = false;
      } else if (this.dialogStatus === "update_acl") {
        //
      }
    },
    get_acl_list(ns) {
      const senddata = initSocketData(
        ns,
        "openx.neverdown.org-v1-AliyunAccessControl",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      let ns = localStorage.getItem("k8s_namespace");
      const result = protoRequest.Response.decode(msg);
      if (result.code === 1) {
        Notification({
          message: binaryToStr(result.raw),
          type: "error",
          duration: 3000,
        });
      }
      switch (result.verb) {
        case "list":
          if (
            result.namespace === ns &&
            result.groupVersionKind.kind === "AliyunAccessControl"
          ) {
            const acl_list = protoOpenx["v1"][
              `${result.groupVersionKind.kind}List`
            ].decode(result.raw).items;
            acl_list.sort((itemA, itemB) => {
              return (
                itemB.metadata.creationTimestamp.seconds -
                itemA.metadata.creationTimestamp.seconds
              );
            });
            this.acl_list = [];
            for (let node of acl_list) {
              this.acl_list.push(node);
            }
          }
          break;
        case "create":
          if (result.code === 0) {
            Notification({
              title: "新增成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "新增失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          break;
        case "delete":
          if (result.code === 0) {
            Notification({
              title: "删除成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "删除失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          this.get_acl_list(ns);
          break;
        case "update":
          if (result.code === 0) {
            Notification({
              title: "更新成功",
              message: "success",
              type: "success",
              duration: 3000,
            });
          } else {
            Notification({
              title: "更新失败",
              message: binaryToStr(result.raw),
              type: "error",
              duration: 3000,
            });
          }
          this.get_acl_list(ns);
          break;
        case "watch":
          const watchEvent = protoRequest.WatchEvent.decode(result.raw);
          const decodeRaw = protoOpenx["v1"]["AliyunAccessControl"].decode(
            watchEvent.raw
          );
          if (watchEvent.type === "ADDED") {
            this.acl_list.unshift(decodeRaw);
          }
          break;
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
