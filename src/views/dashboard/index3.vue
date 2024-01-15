<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tag
        v-for="(tag, index) in dynamicTags"
        :key="index"
        closable
        :disable-transitions="false"
        @close="close_tag(tag)"
        @click="tag_click(tag, index)"
        type="primary"
        effect="dark"
      >
        {{ tag.name }}
      </el-tag>

      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        style="margin-right: 10px"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput"
        >+ New Tag</el-button
      >
      <el-button
        icon="el-icon-copy-document"
        size="small"
        type="info"
        @click="copy_current"
      ></el-button>
      <el-divider content-position="right"></el-divider>

      <AppSpec :app_spec="dynamicTags[this.tagIndex]"></AppSpec>
    </el-card>
  </div>
</template>

<script>
import AppSpec from "@/components/Container/spec";

export default {
  components: {
    AppSpec,
  },
  data() {
    return {
      dynamicTags: [],
      tagIndex: 0,
      inputVisible: "",
      inputValue: "",
    };
  },
  methods: {
    tag_click(tag, index) {
      this.tagIndex = index;
    },
    close_tag(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let inputValue = this.inputValue;
      let inputIndex = this.tagIndex;
      if (inputValue) {
        let push_obj = { index: inputIndex, name: inputValue };
        if (
          this.dynamicTags.findIndex(
            (object) => object.name === push_obj.name
          ) === -1
        ) {
          this.dynamicTags.push(push_obj);
        } else {
          this.$message({ type: "warning", message: "名称冲突" });
        }
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    copy_current() {
      if (typeof this.dynamicTags[this.tagIndex] !== "undefined") {
        let obj = Object.assign({}, this.dynamicTags[this.tagIndex]);
        let copy_str = Math.random().toString(36).slice(-8);
        obj.name = obj.name + "-" + copy_str;
        // console.log(obj);
        this.dynamicTags.push(obj);
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
