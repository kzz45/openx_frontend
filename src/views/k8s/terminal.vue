<template>
  <div style="height: 100%; background: #002833">
    <div id="terminal" ref="terminal"></div>
  </div>
</template>

<script>
import "xterm/css/xterm.css";
import "xterm/lib/xterm.js";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export default {
  name: "Shell",
  data() {
    return {
      shellWs: "",
      term: "", // 保存terminal实例
      rows: 40,
      cols: 100,
    };
  },

  mounted() {
    this.rows = Math.floor(window.innerHeight / 16 - 5);
    this.cols = Math.floor(window.innerWidth / 14);
    const _this = this;

    // 实例化terminal实例
    const term = new Terminal({
      rendererType: "canvas", // 渲染类型
      rows: parseInt(_this.rows), // 行数
      cols: parseInt(_this.cols), // 不指定行数，自动回车后光标从下一行开始
      convertEol: true, // 启用时，光标将设置为下一行的开头
      scrollback: 50, // 终端中的回滚量
      disableStdin: false, // 是否应禁用输入。
      cursorStyle: "underline", // 光标样式
      cursorBlink: true, // 光标闪烁
      theme: {
        foreground: "#7e9192", // 字体
        background: "#002833", // 背景色
        cursor: "help", // 设置光标
        lineHeight: 16,
      },
    });

    const token = localStorage.getItem("termToken");
    let type = "";
    const route = this.$route;
    if (route.query.types === "bash") {
      type = `/ssh/namespace/${route.query.namespace}/pod/${route.query.podname}/shell/${route.query.containername}/shell/token/`;
    } else {
      type = "/log/";
    }
    const url = "wss://" + String(process.env.VUE_APP_BASE_API) + type + token;
    // console.log("url===", url);
    const ws = new WebSocket(url);
    ws.onopen = function (evt) {
      console.log("ws open");
    };
    ws.onclose = function (evt) {
      console.log("ws close");
      ws.close();
    };

    ws.onmessage = function (evt) {
      let reader = new FileReader();
      reader.onload = function (e) {
        term.write(e.target.result);
      };
      reader.readAsText(evt.data);
      term.write(evt.data);
    };
    ws.onerror = function (evt) {
      console.log("ws error: ", evt.data);
    };

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    // 挂载到dom
    term.open(this.$refs["terminal"]);

    fitAddon.fit();

    // 换行并输入起始符“$”
    term.prompt = () => {
      term.write("\r$ ");
    };

    function runFakeTerminal(_this) {
      if (term._initialized) {
        return;
      }
      // 初始化
      term._initialized = true;

      term.writeln("\t\t欢迎使用 OpenX 终端\n\n");

      //   term.prompt();
      term.onData(function (key) {
        const order = {
          // type: "resize", cols: term.cols, rows: term.rows, input: ''
          input: key,
          type: "input",
          cols: term.cols,
          rows: term.rows,
        };
        ws.send(JSON.stringify(order));
        ws.send(
          JSON.stringify({
            input: "",
            type: "resize",
            cols: term.cols,
            rows: term.rows,
          })
        );
      });

      setInterval(() => {
        const xping = { type: "ping", input: "", rows: 0, cols: 0 };
        ws.send(JSON.stringify(xping));
      }, 1000);
      _this.term = term;
    }
    runFakeTerminal(_this);
  },
  methods: {
    onSend(data) {
      this.shellWs.onSend(data);
    },
    trim(str) {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    },
  },
};
</script>
