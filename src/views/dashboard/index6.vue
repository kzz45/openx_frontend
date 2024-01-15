<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-button @click="add_item" size="small">+ New Item</el-button>
      <el-tag v-for="(val, key, index) in items" :key="index"
        >{{ key }} --- {{ val }}</el-tag
      >
      <!-- <codemirror ref="cmEditor" :value="code" :options="cmOptions" /> -->
    </el-card>
  </div>
</template>

<script>
import { codemirror } from "vue-codemirror";

// import base style
import "codemirror/lib/codemirror.css";
// import language js
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/yaml/yaml.js";
// import theme style
import "codemirror/theme/base16-dark.css";
import "codemirror/theme/monokai.css";

export default {
  components: {
    codemirror,
  },
  data() {
    return {
      items: {},
      code: "let a = abc",
      cmOptions: {
        tabSize: 4,
        mode: "text/javascript",
        theme: "monokai",
        lineNumbers: true,
        line: true,
      },
    };
  },
  methods: {
    add_item() {
      if (!this.items.hasOwnProperty("xxx")) {
        this.$set(this.items, "xxx", "yyy");
      } else {
        this.$message({
          type: "warning",
          message: "fuck",
        });
      }
    },
  },
};
</script>
