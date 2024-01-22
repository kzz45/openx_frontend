<template>
  <div>
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
      <el-form ref="alb_obj_refs" :model="alb_obj" size="small">
        <MetaDataTpl></MetaDataTpl>
        <!-- <el-form-item label="instance" prop="instance">
          <el-input v-model="alb_obj.spec.instance.value"></el-input>
        </el-form-item>
        <el-form-item label="overrideListeners" prop="overrideListeners">
          <el-select v-model="alb_obj.spec.overrideListeners.value">
            <el-option label="true" :value="true"></el-option>
            <el-option label="false" :value="false"></el-option>
          </el-select>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="alb_dialog = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit_alb"
          >确 定</el-button
        >
      </span>
    </el-dialog>
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
      key: "",
      value: "",
    },
    overrideListeners: {
      key: "",
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
    ...mapGetters(["message", "namespace"]),
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
    namespace: function () {
      this.get_alb_list(this.namespace);
    },
  },
  data() {
    return {
      textMap: {
        create_alb: "新增",
        update_alb: "编辑",
      },
      dialogStatus: "",
      alb_dialog: false,
      alb_list: [],
      alb_obj: {
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
          instance: {
            key: "",
            value: "",
          },
          overrideListeners: {
            key: "",
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
    },
    delete_alb(row) {},
    submit_alb() {
      if (this.dialogStatus === "create_alb") {
        const ns = localStorage.getItem("k8s_namespace");
        const creata_alb_obj = {
          metadata: {
            name: "demo",
            namespace: ns,
          },
          spec: {
            instance: {
              key: "service.beta.kubernetes.io/alibaba-cloud-loadbalancer-id",
              value: "lb-2ze6mc3pyhuvjs0sxt59k",
            },
            overrideListeners: {
              key: "service.beta.kubernetes.io/alicloud-loadbalancer-force-override-listeners",
              value: "true",
            },
          },
        };
        const message =
          protoOpenx["v1"]["AliyunLoadBalancer"].create(creata_alb_obj);
        const params = protoOpenx["v1"]["AliyunLoadBalancer"]
          .encode(message)
          .finish();
        // console.log(creata_alb_obj, "=====================");
        const createdata = initSocketData(
          ns,
          "openx.neverdown.org-v1-AliyunLoadBalancer",
          "create",
          params
        );
        // console.log(createdata, "=====================");
        sendSocketMessage(createdata, store);
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
