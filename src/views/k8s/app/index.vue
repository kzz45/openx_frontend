<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-tabs v-model="active_tab" @tab-click="tab_click">
        <el-tab-pane label="Deployment" name="Deployment">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-plus"
            @click="create_deplpy"
            >新增</el-button
          >
          <!-- <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入</el-button
          >
          <el-button type="primary" size="small" icon="el-icon-bottom"
            >导入YAML</el-button
          >
          <el-button type="info" size="small" icon="el-icon-copy-document"
            >拷贝</el-button
          >
          <el-button type="warning" size="small" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button type="danger" size="small" icon="el-icon-delete"
            >删除</el-button
          > -->
          <el-table
            :data="deploy_list"
            size="small"
            empty-text="啥也没有"
            border
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="名称" prop="name"></el-table-column>
            <el-table-column label="状态" prop="status"></el-table-column>
            <el-table-column
              label="创建时间"
              prop="create_at"
            ></el-table-column>
            <el-table-column label="操作" width="180px;">
              <template>
                <el-button
                  type="info"
                  icon="el-icon-info"
                  size="small"
                ></el-button>
                <el-button
                  type="primary"
                  icon="el-icon-top"
                  size="small"
                ></el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="StatefulSet" name="StatefulSet"> </el-tab-pane>
        <!-- <el-tab-pane label="DaemonSet"> </el-tab-pane> -->
      </el-tabs>
    </el-card>

    <!-- -------------------------------------------------- -->
    <el-dialog
      :title="deploy_title"
      :visible.sync="deploy_dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      top="5%"
      width="60%"
    >
      <el-tabs>
        <el-tab-pane label="基础信息">
          <el-form
            ref="metadata_form_refs"
            :model="metadata_form"
            size="small"
            label-width="80px"
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="名称">
                  <el-input
                    v-model="metadata_form.name"
                    placeholder="请输入名称"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="命名空间">
                  <el-input
                    v-model="metadata_form.namespace"
                    placeholder=""
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="注解" prop="annotation">
                  <el-button
                    size="small"
                    icon="el-icon-plus"
                    @click="create_annotation"
                  ></el-button>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标签" prop="label">
                  <el-button
                    size="small"
                    icon="el-icon-plus"
                    @click="create_label"
                  ></el-button>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="" prop="annotation_list">
                  <el-tag
                    v-for="(item, index) in annotation_list"
                    :key="index"
                    closable
                    >{{ item.key }}:{{ item.value }}</el-tag
                  >
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="" prop="label_list">
                  <el-tag
                    v-for="(item, index) in label_list"
                    :key="index"
                    closable
                    >{{ item.key }}:{{ item.value }}</el-tag
                  >
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="容器信息">
          <el-tag
            v-for="(pod_form, index) in pod_form_list"
            :key="index"
            closable
            :disable-transitions="false"
            @close="close_pod_tag(pod_form)"
            @click="pod_tag_click(pod_form, index)"
            type="primary"
            effect="dark"
            style="margin-right: 10px"
          >
            {{ pod_form.name }}
          </el-tag>

          <el-input
            class="input-new-tag"
            v-if="pod_name_visible"
            v-model="pod_form_name"
            ref="saveTagInput"
            size="small"
            style="margin-right: 10px"
            @keyup.enter.native="add_pod_form"
            @blur="add_pod_form"
          >
          </el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="pod_name_input"
            >+ New Container</el-button
          >
          <el-divider content-position="left">Container</el-divider>

          <PodTemplate
            v-if="pod_form_list.length > 0"
            :pod_form="pod_form_list[this.pod_form_index]"
            @add_env="add_pod_env"
            @del_env="del_pod_env"
            @edit_env="edit_pod_env"
            @save_env="save_pod_env"
          ></PodTemplate>
        </el-tab-pane>
        <el-tab-pane label="服务路由"></el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="deploy_dialog = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit_deploy"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- -------------------------------------------------- -->
    <el-dialog
      :title="annotation_title"
      :visible.sync="annotation_dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%"
    >
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="annotation_dialog = false" type="info"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="submit_annotation"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- -------------------------------------------------- -->
    <el-dialog
      :title="label_title"
      :visible.sync="label_dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%"
      append-to-body
    >
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="label_dialog = false" type="info"
          >取 消</el-button
        >
        <el-button type="primary" size="small" @click="submit_label"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- -------------------------------------------------- -->
    <el-dialog
      :title="env_title"
      :visible.sync="env_dialog"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%"
      append-to-body
    ></el-dialog>
    <!-- -------------------------------------------------- -->
    <!-- -------------------------------------------------- -->
    <!-- -------------------------------------------------- -->
  </div>
</template>

<script>
import PodTemplate from "../components/pod.vue";

export default {
  name: "NativeApp",
  components: {
    PodTemplate,
  },
  data() {
    return {
      active_tab: "Deployment",
      deploy_title: "",
      deploy_dialog: false,
      deploy_list: [{ name: "xxx", status: "xxx", create_at: "xxx" }],
      // --------------------------------------------------
      metadata_form: {},
      annotation_list: [],
      annotation_title: "",
      annotation_dialog: false,
      label_list: [],
      label_title: "",
      label_dialog: false,
      // --------------------------------------------------
      pod_name_visible: false,
      pod_form_name: "",
      pod_form_list: [],
      pod_form_index: 0,
      pod_form: {
        name: "",
        replicas: 0,
      },
      env_dialog: false,
      env_list: [],
      env_title: "",
      // --------------------------------------------------
      // --------------------------------------------------
      // --------------------------------------------------
    };
  },
  methods: {
    tab_click() {},
    create_deplpy() {
      this.deploy_dialog = true;
      this.deploy_title = "新增Deploy";
    },
    close_pod_tag(tag) {
      this.pod_form_list.splice(this.pod_form_list.indexOf(tag), 1);
    },
    pod_tag_click(tag, index) {
      this.pod_form_index = index;
    },
    add_pod_form() {
      let pod_form_name = this.pod_form_name;
      let inputIndex = this.pod_form_index;
      if (pod_form_name) {
        let default_pod_obj = {
          index: inputIndex,
          name: pod_form_name,
          replicas: 0,
          env_list: [],
          cpu_limit: 0,
          cpu_request: 0,
          mem_limit: 0,
          mem_request: 0,
        };
        if (
          this.pod_form_list.findIndex(
            (object) => object.name === default_pod_obj.name
          ) === -1
        ) {
          this.pod_form_list.push(default_pod_obj);
        } else {
          this.$message({ type: "warning", message: "名称冲突" });
        }
      }
      this.pod_name_visible = false;
      this.pod_form_name = "";
    },
    pod_name_input() {
      this.pod_name_visible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    submit_deploy() {},
    create_annotation() {
      this.annotation_dialog = true;
      this.annotation_title = "新增注解";
    },
    submit_annotation() {},
    create_label() {
      this.label_dialog = true;
      this.label_title = "新增标签";
    },
    submit_label() {},
    add_pod_env() {
      this.pod_form_list[this.pod_form_index].env_list.push({
        edit: false,
        key: "key",
        value: "value",
      });
    },
    edit_pod_env(row) {
      row.edit = false;
    },
    save_pod_env(row) {
      row.edit = true;
    },
    del_pod_env(row) {
      this.pod_form_list[this.pod_form_index].env_list = this.pod_form_list[
        this.pod_form_index
      ].env_list.filter((item) => item !== row);
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
