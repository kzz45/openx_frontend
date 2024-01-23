<template>
  <div>
    <el-container>
      <el-header style="height: 76px">
        <div class="header-ico">
          <el-dropdown
            trigger="hover"
            @command="
              (command) => {
                handler_command(command);
              }
            "
          >
            <img
              src="../../assets/k8s.png"
              style="height: 100%; cursor: pointer"
            />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="feishu">飞书联系</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <el-row class="panel-group">
          <el-col
            v-for="ns in namespace_list"
            :key="ns"
            :span="6"
            class="card-panel"
            @click.native="goto_ns(ns)"
          >
            {{ ns }}
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import router from "@/router";
import { routerToNs } from "@/utils/k8s";

export default {
  name: "Namespace",
  data() {
    return {
      namespace_list: [],
    };
  },
  mounted() {
    this.get_ns_list();
  },
  methods: {
    get_ns_list() {
      const rules = JSON.parse(localStorage.getItem("clusterRole"));
      if (!rules) {
        this.$message({
          type: "error",
          message: "",
        });
      }
      const ns_list = [];
      for (const ns in rules) {
        ns_list.push(ns);
      }
      ns_list.sort();
      this.namespace_list = ns_list;
    },
    goto_ns(ns) {
      // console.log(ns);
      localStorage.setItem("k8s_namespace", ns);
      // routerToNs(ns);
      router.push({ path: "/corev1/pod" });
    },
    handler_command(command) {
      if (command === "logout") {
        localStorage.removeItem("k8s_token");
        localStorage.removeItem("k8s_token_expire");
        localStorage.removeItem("clusterRole");
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.el-header {
  font-weight: 600;
  text-align: left;
  line-height: 60px;
  box-shadow: 0px 3px 5px -2px rgb(5 0 10 / 40%);
  .header-ico {
    height: 100%;
    float: right;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    gap: 20px;
  }
}
.el-header:hover {
  box-shadow: 0px 3px 5px -2px rgb(0 0 0 / 100%);
}

.panel-group {
  margin-top: 16px;

  .card-panel {
    width: 300px;
    height: 60px;
    padding: 16px;
    font-size: 1.3rem;
    font-weight: bold;
    margin: 10px 30px;
    border-radius: 8px;
    display: flex;
    align-self: stretch;
    line-height: 25px;
    background-color: #4f545c29;
    box-shadow: 0px 3px 5px -2px rgb(5 0 10 / 40%);
  }
  .card-panel:hover {
    background-color: #abb2b9;
    box-shadow: 0px 3px 5px -2px rgb(0 0 0 / 100%);
  }
}
</style>
