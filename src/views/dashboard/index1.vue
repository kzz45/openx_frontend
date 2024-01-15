<template>
  <div class="app-container">
    <el-card class="box-card"> </el-card>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/k8s";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.nevercase.sargeras.pkg.aggregator.proto;

export default {
  data() {
    return {};
  },
  mounted() {
    this.get_ns();
  },
  created() {},
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
  },
  computed: {
    ...mapGetters(["message"]),
  },
  methods: {
    get_ns() {
      const senddata = initSocketData("hero-dev1", "core-v1-Node", "list");
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      const result = protoRequest.Response.decode(msg);

      if (result.code === 1) {
        const err_msg = String.fromCharCode.apply(null, result.raw);
        this.$message({
          type: "error",
          message: err_msg,
        });
      }
      if (result.verb === "list" && result.namespace === "hero-dev1") {
        console.log(result);
        const xx = protoApi["core"]["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(xx);
      }
    },
  },
};
</script>

<style scoped>
.el-input {
  width: 300px;
}

.el-select {
  width: 300px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
