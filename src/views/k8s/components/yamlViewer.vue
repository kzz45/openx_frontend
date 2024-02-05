<template>
  <div class="yaml-editor CodeMirror-wrap">
    <textarea id="yaml" ref="textarea"></textarea>
  </div>
</template>

<script>
import _CodeMirror from "codemirror";
import "codemirror/addon/lint/lint.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/addon/lint/lint.js";
import "codemirror/addon/lint/yaml-lint.js";

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
      mode: "yaml",
      // 编辑器实例
      coder: null,
      yamlViewerOptions: {
        mode: "text/x-yaml",
        theme: "monokai",
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        cursorHeight: 1,
        lineWrapping: true,
        autoRefresh: true,
        autofocus: true,
        hintOptions: {
          completeSingle: false,
        },
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
    this.initialize();
  },
  methods: {
    initialize() {
      this.coder = CodeMirror.fromTextArea(
        this.$refs.textarea,
        this.yamlViewerOptions
      );
      // this.coder.setValue(this.value || this.code);
      this.coder.on("change", (coder) => {
        // this.code = coder.getValue();
        this.$emit("changed", coder.getValue());
      });
    },
  },
};
</script>

<style>
.yaml-editor {
  height: 100%;
  position: relative;
}
.CodeMirror-gutter-wrapper {
  left: -29px !important;
}
.CodeMirror-line {
  z-index: 5 !important;
}
.CodeMirror-cursors {
  z-index: 6 !important;
}
.CodeMirror {
  height: calc(100vh - 360px);
  min-height: 300px;
  text-align: left;
}
.CodeMirror-scroll {
  min-height: 300px;
}
.cm-s-rubyblue span.cm-string {
  color: #f08047;
}
.CodeMirror-gutters {
  z-index: -1 !important;
}
</style>
