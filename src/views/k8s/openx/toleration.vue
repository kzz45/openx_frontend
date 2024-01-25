<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-table
        :data="toleration_list"
        size="small"
        empty-text="啥也没有"
        border
      ></el-table>
    </el-card>
  </div>
</template>

<script>
const TolerationObj = {
  metadata: {
    name: "",
    namespace: localStorage.getItem("k8s_namespace"),
    annotations: {},
    labels: {},
  },
  spec: {
    toleration: {
      effect: "",
      key: "",
      operator: "",
      value: "",
    },
  },
};

export default {
  data() {
    return {
      toleration_list: [],
    };
  },
};
</script>
