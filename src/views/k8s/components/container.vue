<template>
  <div>
    <el-form
      ref="container_form_refs"
      :model="container_form"
      size="small"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="容器名称" prop="name">
            <el-input v-model="container_form.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <imageHub
        :image="container_form.image"
        @image_input="
          (image) => {
            container_obj.image = image;
          }
        "
      ></imageHub>
      <el-row>
        <el-col :span="12">
          <el-form-item label="拉取策略" prop="imagePullPolicy">
            <el-select v-model="container_form.imagePullPolicy" clearable>
              <el-option label="Always" value="Always"></el-option>
              <el-option label="Never" value="Never"></el-option>
              <el-option label="IfNotPresent" value="IfNotPresent"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="拉取秘钥" prop="imagePullPolicy"></el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="命令" prop="command">
            <el-input></el-input>
            <el-tooltip placement="right" effect="light">
              <div
                slot="content"
                v-for="(item, index) in command_list"
                :key="index"
              >
                <el-tag size="small" type="info">{{ item }}</el-tag>
                <br />
              </div>
              <el-button
                type="info"
                icon="el-icon-collection-tag"
                size="small"
              ></el-button>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="参数" prop="args">
            <el-button size="small" icon="el-icon-circle-plus"></el-button>
            <el-tooltip placement="right" effect="light">
              <div
                slot="content"
                v-for="(item, index) in args_list"
                :key="index"
              >
                <el-tag size="small" type="info">{{ item }}</el-tag>
                <br />
              </div>
              <el-button
                type="info"
                icon="el-icon-collection-tag"
                size="small"
              ></el-button>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="CPU限制">
            <el-input v-model="container_form.resources_limits_cpu">
              <template slot="append">core</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="CPU请求">
            <el-input v-model="container_form.resources_requests_cpu">
              <template slot="append">core</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="内存限制">
            <el-input v-model="container_form.resources_limits_memory">
              <template slot="append">Mi</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="内存请求">
            <el-input v-model="container_form.resources_requests_memory">
              <template slot="append">Mi</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import imageHub from "./imageHub";

export default {
  components: {
    imageHub,
  },
  props: {
    container_form: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  watch: {
    container_form: {
      handler(newVal) {
        this.args_list = [];
        this.args_list = newVal.args;
        this.command_list = [];
        this.command_list = newVal.command;
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      container_obj: {
        name: "",
        image: "",
        command: [],
        args: [],
        resources: {
          limits: {
            cpu: "",
            memory: "",
          },
          requests: {
            cpu: "",
            memory: "",
          },
        },
      },
      args_list: [],
      command_list: [],
    };
  },
  methods: {},
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
