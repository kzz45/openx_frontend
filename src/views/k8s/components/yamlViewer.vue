<template>
  <div>
    <textarea ref="textarea"></textarea>
  </div>
</template>

<script>
import _CodeMirror from "codemirror";
import { codemirror } from "vue-codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/theme/base16-dark.css";
import "codemirror/theme/monokai.css";

const CodeMirror = window.CodeMirror || _CodeMirror;

export default {
  props: {
    // 外部传入的内容
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 内部真实的内容
      code: "",
      // 默认的语法类型
      mode: "javascript",
      // 编辑器实例
      coder: null,
      yamlViewerOptions: {
        mode: "text/javascript",
        theme: "monokai",
        indentWithTabs: true,
        lineNumbers: true,
        smartIndent: true,
        // lineWrapping: true,
        autoRefresh: true,
        autofocus: true,
      },
    };
  },
  watch: {
    value: {
      handler(val) {
        setTimeout(() => {
          this.coder.setValue(String(val));
        }, 0);
      },
      immediate: true,
    },
  },
  mounted() {
    this._initialize();
  },
  methods: {
    _initialize() {
      this.coder = CodeMirror.fromTextArea(
        this.$refs.textarea,
        this.yamlViewerOptions
      );
      this.coder.setValue(this.value || this.code);
      this.coder.on("change", (coder) => {
        // this.code = coder.getValue();
        this.$emit("changed", coder.getValue());
      });
    },
  },
};
</script>
