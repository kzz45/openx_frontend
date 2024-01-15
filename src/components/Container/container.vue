<template>
  <div>
    <el-form
      ref="app_form_refs"
      :model="app_form"
      size="small"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="容器名称" prop="name">
            <el-input
              v-model="app_form.name"
              placeholder=""
              @blur="change_name($event)"
            ></el-input></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="容器镜像" prop="image">
            <el-cascader
              v-model="app_form.image"
              :options="image_options"
            ></el-cascader>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="拉取策略">
            <el-select v-model="app_form.pull_policy" filterable>
              <el-option label="手动更新" value="manual"></el-option>
              <el-option label="原地更新" value="in-place-update"></el-option>
              <el-option
                label="滚动更新"
                value="rolling-update"
              ></el-option> </el-select></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="拉取秘钥">
            <el-select v-model="app_form.pull_policy" filterable>
              <el-option label="手动更新" value="manual"></el-option>
              <el-option label="原地更新" value="in-place-update"></el-option>
              <el-option label="滚动更新" value="rolling-update"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="命令">
            <el-button
              size="mini"
              icon="el-icon-circle-plus"
              style="vertical-align: middle"
            ></el-button></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="参数">
            <el-button
              size="mini"
              icon="el-icon-circle-plus"
              style="vertical-align: middle"
            ></el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="容器端口">
            <el-input
              v-model="app_form.name"
              placeholder=""
            ></el-input></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="环境变量">
            <el-button
              size="mini"
              icon="el-icon-circle-plus"
              style="vertical-align: middle"
            ></el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="CPU请求">
            <el-input placeholder="请输入内容" v-model="app_form.cpu_request">
              <template slot="append">core</template>
            </el-input>
          </el-form-item></el-col
        >
        <el-col :span="12">
          <el-form-item label="内存请求">
            <el-input placeholder="请输入内容" v-model="app_form.mem_request">
              <template slot="append">Mi</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="CPU限制">
            <el-input placeholder="请输入内容" v-model="app_form.cpu_limit">
              <template slot="append">core</template>
            </el-input>
          </el-form-item></el-col
        >
        <el-col :span="12">
          <el-form-item label="内存限制">
            <el-input placeholder="请输入内容" v-model="app_form.mem_limit">
              <template slot="append">Mi</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Container",
  props: {
    app_form: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      image_options: [],
    };
  },
  methods: {
    change_name(row) {
      this.$emit("change_name", row.target.value);
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

.el-table {
  width: 100%;
  margin-top: 10px;
}

.el-button {
  vertical-align: top;
}
</style>
