<template>
  <div>
    <el-form
      ref="application_form_refs"
      :model="application_form"
      size="small"
      label-width="100px"
    >
      <el-tabs v-model="application_form_tabs" tab-position="left">
        <el-tab-pane label="Spec" name="spec">
          <el-row>
            <el-col :span="12">
              <el-form-item label="应用名称" prop="appName">
                <el-input v-model="application_form.appName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="副本" prop="replicas">
                <el-input-number
                  v-model="application_form.replicas"
                  :min="0"
                  :max="100"
                  style="width: 200px"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="更新策略" prop="watchPolicy">
                <el-select v-model="application_form.watchPolicy">
                  <el-option label="手动更新" value="manual"></el-option>
                  <el-option
                    label="滚动更新"
                    value="rolling-upgrade"
                  ></el-option>
                  <el-option
                    label="自动更新"
                    value="in-place-upgrade"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12"></el-col> -->
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="Pod" name="pod">
          <el-row>
            <el-col :span="12">
              <el-form-item label="Labels" prop="labels">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_labels"
                ></el-button>
                <!-- <el-input v-model="application_form.labels"></el-input> -->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Annotations" prop="annotations">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_annotations"
                ></el-button>
                <!-- <el-input v-model="application_form.annotations"></el-input> -->
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="容器名称" prop="name">
                <el-input
                  v-model="application_form.pod.spec.containers[0].name"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="镜像" prop="image">
                <el-input
                  v-model="application_form.pod.spec.containers[0].image"
                ></el-input>
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="选择镜像"
                  placement="top"
                >
                  <el-button
                    size="small"
                    icon="el-icon-check"
                    style="margin-left: 10px"
                    @click="select_image"
                  ></el-button>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="command" prop="command">
                <el-input
                  v-model="item.value"
                  v-for="(item, index) in application_form.pod.spec
                    .containers[0].command"
                  :key="index"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="args" prop="args">
                <el-input
                  v-model="item.value"
                  v-for="(item, index) in application_form.pod.spec
                    .containers[0].args"
                  :key="index"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="内存限制" prop="mem_limit">
                <el-input
                  v-model="
                    application_form.pod.spec.containers[0].resources.limits
                      .memory
                  "
                >
                  <template slot="append">Mi</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内存请求" prop="mem_request">
                <el-input
                  v-model="
                    application_form.pod.spec.containers[0].resources.requests
                      .memory
                  "
                >
                  <template slot="append">Mi</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="CPU限制" prop="cpu_limit">
                <el-input
                  v-model="
                    application_form.pod.spec.containers[0].resources.limits.cpu
                  "
                >
                  <template slot="append">Core</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="CPU请求" prop="cpu_request">
                <el-input
                  v-model="
                    application_form.pod.spec.containers[0].resources.requests
                      .cpu
                  "
                >
                  <template slot="append">Core</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="24">
              <el-form-item label="端口" prop="ports">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_ports"
                ></el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row
            v-if="application_form.pod.spec.containers[0].ports.length > 0"
          >
            <el-form-item>
              <el-table
                :data="application_form.pod.spec.containers[0].ports"
                size="mini"
                border
              >
                <el-table-column label="名称" prop="name"></el-table-column>
                <el-table-column label="协议" prop="protocol"></el-table-column>
                <el-table-column
                  label="容器端口"
                  prop="containerPort"
                ></el-table-column>
                <el-table-column label="操作"></el-table-column>
              </el-table>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="环境变量" prop="env">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_env"
                ></el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="卷" prop="volumes">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_volumes"
                ></el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="卷挂载" prop="volumeMounts">
                <el-button
                  size="small"
                  icon="el-icon-plus"
                  @click="add_volumeMounts"
                ></el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="labels_dialog"
      append-to-body
    >
    </el-dialog>

    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="annotations_dialog"
      append-to-body
    ></el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    application_form: {
      type: Object,
      default: () => {
        return {
          appName: "",
          replicas: 0,
          watchPolicy: "in-place-upgrade",
          pod: {
            // labels: {},
            // annotations: {},
            spec: {
              containers: [
                {
                  name: "",
                  image: "",
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
                  env: [],
                  args: [],
                  ports: [],
                  command: [],
                  volumeMounts: [],
                },
              ],
              volumns: [],
            },
          },
        };
      },
    },
  },
  watch: {
    application_form: {
      handler(newVal) {
        // console.log(newVal, "============");
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      application_form_tabs: "spec",
      textMap: {
        create_labels: "新增标签",
        update_labels: "编辑标签",
        create_annotations: "新增注解",
        update_annotations: "编辑注解",
      },
      dialogStatus: "",
      labels_dialog: false,
      annotations_dialog: false,
    };
  },
  methods: {
    add_labels() {},
    add_annotations() {},
    select_image() {},
    add_ports() {
      this.application_form.pod.spec.containers[0].ports.push({
        name: "",
        protocol: "TCP",
        containerPort: 0,
      });
    },
    add_env() {},
    add_volumes() {},
    add_volumeMounts() {},
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
