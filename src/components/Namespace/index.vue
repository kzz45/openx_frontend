<template>
  <div>
    <el-select
      v-model="selected_namespace"
      placeholder="选择命名空间"
      filterable
    >
      <el-option
        v-for="item in namespace_list"
        :key="item.name"
        :label="item.name"
        :value="item.name"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "GlobalNamespace",
  data() {
    return {
      namespace_list: [],
      selected_namespace:
        localStorage.getItem("k8s_namespace") || "kube-system",
    };
  },
  computed: {
    ...mapGetters(["namespace"]),
  },
  watch: {
    selected_namespace(newVal) {
      localStorage.setItem("k8s_namespace", newVal);
      this.$message({
        type: "success",
        message: "切换命名空间: " + newVal,
      });
      this.$store.commit({
        type: "k8s/SET_SELECT_NAMESPACE",
        namespace: newVal,
      });
    },
  },
  created() {
    this.get_ns_list();
  },
  methods: {
    get_ns_list() {
      const rules = JSON.parse(localStorage.getItem("clusterRole"));
      this.namespace_list = [];
      for (let rule in rules) {
        this.namespace_list.push({
          name: rule,
        });
      }
    },
  },
};
</script>
