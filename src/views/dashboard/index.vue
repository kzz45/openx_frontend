<template>
  <div class="app-container"></div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoJingx = protoRoot.github.com.kzz45.discovery.pkg.apis.jingx;

export default {
  computed: {
    ...mapGetters(["message", "namespace"]),
  },
  data() {
    return {
      project_list: [],
    };
  },
  watch: {
    message: function () {
      this.socket_onmessage(this.message);
    },
  },
  mounted() {},
  created() {
    this.get_project_list();
  },
  methods: {
    get_project_list() {
      const senddata = initSocketData(
        "kube-system",
        "jingx-v1-Project",
        "list"
      );
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      const result = protoRequest.Response.decode(msg);
      // console.log(result);
      if (result.code === 1) {
        const err_msg = String.fromCharCode.apply(null, result.raw);
        this.$message({
          type: "error",
          message: err_msg,
        });
      }
      if (
        result.verb === "list" &&
        result.groupVersionKind.kind === "Project"
      ) {
        const project_list = protoJingx["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        console.log(project_list);
      }
    },
  },
};
</script>
