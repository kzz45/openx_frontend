<template>
  <div>
    <el-form ref="image_refs" :model="image" size="small" label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="项目">
            <el-select v-model="project_value" filterable @change="change_pro">
              <el-option
                v-for="project in project_list"
                :key="project.metadata.name"
                :label="project.metadata.name"
                :value="project.metadata.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="地址">
            <el-select v-model="domain_value" filterable>
              <el-option
                v-for="domain in domain_list"
                :key="domain"
                :label="domain"
                :value="domain"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="Repo">
            <el-select v-model="repo_value" filterable @change="change_repo">
              <el-option
                v-for="repo in filter_repo_list"
                :key="repo.spec.repositoryMeta.repositoryName"
                :label="repo.spec.repositoryMeta.repositoryName"
                :value="repo.spec.repositoryMeta.repositoryName"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Tag">
            <el-select v-model="tag_value" filterable @change="change_tag">
              <el-option
                v-for="tag in filter_tag_list"
                :key="tag.spec.tag"
                :label="tag.spec.tag"
                :value="tag.spec.tag"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="镜像">
          <el-col>
            <el-input v-model="image_input" style="width: 80%"></el-input>
          </el-col>
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item label="镜像信息">
          <el-col :span="8">
            <el-input v-model="tag_obj.spec.dockerImage.author">
              <template slot="prepend">作者</template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-input v-model="tag_obj.spec.dockerImage.lastModifiedTime">
              <template slot="prepend">最后修改时间</template>
            </el-input>
          </el-col>
          <el-col :span="8">
            <el-input v-model="tag_obj.spec.dockerImage.sha256">
              <template slot="prepend">sha256</template>
            </el-input>
          </el-col>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import store from "@/store";
import { mapGetters } from "vuex";
import { initSocketData, sendSocketMessage } from "@/api/k8s";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const protoGuldan = protoRoot.github.com.kzz45.discovery.pkg.apis.jingx;

export default {
  props: {
    image: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  computed: {
    ...mapGetters(["message", "namespace"]),
  },
  watch: {
    message: {
      handler() {
        this.socket_onmessage(this.message);
      },
    },
    image: {
      handler(newVal) {
        console.log("========", newVal);
      },
    },
  },
  mounted() {
    let ns = localStorage.getItem("k8s_namespace");
    this.get_project_list(ns);
    this.get_repo_list(ns);
    this.get_tag_list(ns);
  },
  data() {
    return {
      project_list: [],
      project_value: "",
      domain_list: [],
      domain_value: "",
      repo_list: [],
      filter_repo_list: [],
      repo_value: "",
      filter_tag_list: [],
      tag_list: [],
      tag_value: "",
      tag_obj: {
        metadata: {},
        spec: {
          dockerImage: {
            author: "",
            lastModifiedTime: 0,
            sha256: "",
          },
        },
      },
      image_input: "",
    };
  },
  methods: {
    get_project_list(ns) {
      const senddata = initSocketData(ns, "guldan-v1-Project", "list");
      sendSocketMessage(senddata, store);
    },
    change_pro() {
      this.filter_repo_list = this.repo_list.filter((item) => {
        return item.spec.repositoryMeta.projectName === this.project_value;
      });
      const project = this.project_list.findIndex((item) => {
        return item.metadata.name === this.project_value;
      });
      this.domain_list = this.project_list[project].spec.domains;
    },
    change_repo() {
      this.filter_tag_list = this.tag_list.filter((item) => {
        return (
          item.spec.repositoryMeta.projectName === this.project_value &&
          item.spec.repositoryMeta.repositoryName === this.repo_value
        );
      });
    },
    change_tag() {
      const tag = this.tag_list.findIndex((item) => {
        return item.spec.tag === this.tag_value;
      });
      this.tag_obj = Object.assign({}, this.tag_list[tag]);
      this.image_input =
        this.domain_value +
        "/" +
        this.project_value +
        "/" +
        this.repo_value +
        ":" +
        this.tag_value;
      this.$emit("image_input", this.image_input);
    },
    show_image() {
      const imageArr = this.image.split("/");
      this.project_value = imageArr[1] || "";
      this.domain_value = imageArr[0] || "";
      if (imageArr[2]) {
        const tagArr = imageArr[2].split(":");
        this.repo_value = tagArr[0] || "";
        this.tag_value = tagArr[1] || "";
      } else {
        this.repo_value = "";
        this.tag_value = "";
      }
      this.image_input = this.image_str();
    },
    image_str() {
      if (
        this.project_value &&
        this.domain_value &&
        this.repo_value &&
        this.tag_value
      ) {
        return (
          this.domain_value +
          "/" +
          this.project_value +
          "/" +
          this.repo_value +
          ":" +
          this.tag_value
        );
      } else {
        return String(this.image);
      }
    },
    get_repo_list(ns) {
      const senddata = initSocketData(ns, "guldan-v1-Repository", "list");
      sendSocketMessage(senddata, store);
    },
    get_tag_list(ns) {
      const senddata = initSocketData(ns, "guldan-v1-Tag", "list");
      sendSocketMessage(senddata, store);
    },
    socket_onmessage(msg) {
      const result = protoRequest.Response.decode(msg);
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
        const project_list = protoGuldan["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(project_list);
        this.project_list = [];
        for (let cm of project_list) {
          this.project_list.push(cm);
        }
      } else if (
        result.verb === "list" &&
        result.groupVersionKind.kind === "Repository"
      ) {
        const repo_list = protoGuldan["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(repo_list);
        this.repo_list = [];
        for (let cm of repo_list) {
          this.repo_list.push(cm);
        }
      } else if (
        result.verb === "list" &&
        result.groupVersionKind.kind === "Tag"
      ) {
        const tag_list = protoGuldan["v1"][
          `${result.groupVersionKind.kind}List`
        ].decode(result.raw).items;
        // console.log(tag_list);
        this.tag_list = [];
        for (let cm of tag_list) {
          this.tag_list.push(cm);
        }
      }
    },
  },
};
</script>

<style scoped>
.el-input {
  width: 200px;
}

.el-select {
  width: 200px;
}

.el-button {
  vertical-align: top;
}
</style>
