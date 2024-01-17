<template>
  <div>
    <el-form
      ref="pod_form_refs"
      :model="pod_form"
      size="small"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="名称">
            <el-input v-model="pod_form.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="副本">
            <el-input-number
              v-model="pod_form.replicas"
              :min="0"
              :max="10"
              style="width: 200px"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="镜像地址">
            <el-select
              v-model="pod_form.image_project"
              placeholder="选择项目"
              clearable
              style="width: 20%"
            >
              <el-option
                v-for="(item, index) in pod_form.image_project_list"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
            <el-select
              v-model="pod_form.image_domain"
              placeholder="选择地址"
              clearable
              style="width: 20%; margin-left: 10px"
            >
              <el-option
                v-for="(item, index) in pod_form.image_domain_list"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
            <el-select
              v-model="pod_form.image_repo"
              placeholder="选择Repo"
              clearable
              style="width: 20%; margin-left: 10px"
            >
              <el-option
                v-for="(item, index) in pod_form.image_repo_list"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
            <el-select
              v-model="pod_form.image_tag"
              placeholder="选择Tag"
              clearable
              style="width: 20%; margin-left: 10px"
            >
              <el-option
                v-for="(item, index) in pod_form.image_tag_list"
                :key="index"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="端口">
            <el-input
              v-model="pod_form.port_name"
              placeholder="端口名称"
              style="width: 20%"
            ></el-input>
            <el-select
              v-model="pod_form.port_protocol"
              style="width: 20%; margin-left: 10px"
            >
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
            </el-select>
            <el-input
              v-model="pod_form.container_port"
              placeholder="容器端口"
              style="width: 20%; margin-left: 10px"
            ></el-input>
            <el-input
              v-model="pod_form.host_port"
              placeholder="宿主机端口"
              style="width: 20%; margin-left: 10px"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="命令">
            <el-input v-model="pod_form.command" style="width: 80%"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="参数">
            <el-input v-model="pod_form.args" style="width: 80%"></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="环境变量">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="add_env"
            ></el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item>
            <el-table
              :data="pod_form.env_list"
              size="mini"
              empty-text="啥也没有"
              border
              style="width: 80%"
            >
              <el-table-column label="Key" prop="key">
                <template slot-scope="scoped">
                  <el-input
                    v-if="scoped.row.edit"
                    v-model="scoped.row.key"
                  ></el-input>
                  <span v-else> {{ scoped.row.key }}</span>
                </template>
              </el-table-column>
              <el-table-column label="Value" prop="value">
                <template slot-scope="scoped">
                  <el-input
                    v-if="scoped.row.edit"
                    v-model="scoped.row.value"
                  ></el-input>
                  <span v-else> {{ scoped.row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120px;">
                <template slot-scope="scoped">
                  <el-button
                    v-if="scoped.row.edit"
                    type="success"
                    size="mini"
                    icon="el-icon-check"
                    @click="edit_env(scoped.row)"
                  ></el-button>
                  <el-button
                    v-else
                    type="warning"
                    size="mini"
                    icon="el-icon-edit"
                    @click="save_env(scoped.row)"
                  ></el-button>
                  <el-button
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="del_env(scoped.row)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="CPU限制">
            <el-input v-model="pod_form.cpu_limit">
              <template slot="append">core</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="CPU请求">
            <el-input v-model="pod_form.cpu_request">
              <template slot="append">core</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="内存限制">
            <el-input v-model="pod_form.mem_limit">
              <template slot="append">Mi</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="内存请求">
            <el-input v-model="pod_form.mem_request">
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
  props: {
    pod_form: {
      type: Object,
      default: function () {
        return {
          replicas: 0,
          env_list: [],
        };
      },
    },
  },
  watch: {},
  computed: {},
  data() {
    return {};
  },
  methods: {
    add_env() {
      this.$emit("add_env");
    },
    del_env(row) {
      this.$emit("del_env", row);
    },
    edit_env(row) {
      this.$emit("edit_env", row);
    },
    save_env(row) {
      this.$emit("save_env", row);
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
