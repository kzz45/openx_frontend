<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput"
        >+ New Tag</el-button
      >
      <el-tabs
        v-model="active_tab"
        tab-position="left"
        closable
        @tab-remove="removeTab"
      >
        <el-tab-pane
          :label="item.name"
          :name="item.name"
          v-for="(item, index) in tab_list"
          :key="index"
          >{{ item.name }}</el-tab-pane
        >
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputVisible: false,
      inputValue: "",
      active_tab: "",
      tab_list: [],
    };
  },
  methods: {
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        let push_obj = { name: inputValue };
        if (
          this.tab_list.findIndex((object) => object.name === push_obj.name) ===
          -1
        ) {
          this.tab_list.push(push_obj);
          this.active_tab = inputValue;
        } else {
          this.$message({ type: "warning", message: "名称冲突" });
        }
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    removeTab(tab) {
    //   console.log("====", tab, activeName);
      let tabs = this.tab_list;
      let activeName = this.active_tab;

      if (activeName === tab) {
        tabs.forEach((item, index) => {
          if (item.name === tab) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      this.active_tab = activeName;
      this.tab_list = tabs.filter((item) => item.name !== tab);
    },
  },
};
</script>
