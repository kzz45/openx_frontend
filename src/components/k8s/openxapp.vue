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
              <el-form-item label="标签" prop="labels">
                <el-button
                  size="small"
                  icon="el-icon-circle-plus"
                  @click="add_labels"
                ></el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="注解" prop="annotations">
                <el-button
                  size="small"
                  icon="el-icon-circle-plus"
                  @click="add_annotations"
                ></el-button>
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
              <el-form-item label="启动命令" prop="command">
                <el-input
                  v-model="item.value"
                  v-for="(item, index) in application_form.pod.spec
                    .containers[0].command"
                  :key="index"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="参数" prop="args">
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
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="添加端口"
                  placement="top"
                >
                  <el-button
                    size="small"
                    icon="el-icon-circle-plus"
                    @click="add_container_ports"
                  ></el-button>
                </el-tooltip>
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
                <el-table-column label="名称" prop="name">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.name"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.name"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="协议" prop="protocol">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.protocol"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.protocol"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="容器端口" prop="containerPort">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.containerPort"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.containerPort"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                  <template slot-scope="scoped">
                    <el-button
                      type="primary"
                      size="mini"
                      :icon="
                        scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                      "
                      @click="container_port_edit(scoped.row, scoped.row.isSet)"
                    ></el-button>
                    <el-button
                      v-if="!scoped.row.isSet"
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="
                        container_port_del(
                          application_form.pod.spec.containers[0].ports,
                          scoped.$index
                        )
                      "
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="环境变量" prop="env">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="添加环境变量"
                  placement="top"
                >
                  <el-button
                    size="small"
                    icon="el-icon-circle-plus"
                    @click="add_container_env"
                  ></el-button>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="application_form.pod.spec.containers[0].env.length > 0">
            <el-form-item>
              <el-table
                :data="application_form.pod.spec.containers[0].env"
                size="mini"
                border
              >
                <el-table-column label="name" prop="name">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.name"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.name"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="value" prop="value">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.value"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.value"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                  <template slot-scope="scoped">
                    <el-button
                      type="primary"
                      size="mini"
                      :icon="
                        scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                      "
                      @click="container_env_edit(scoped.row, scoped.row.isSet)"
                    ></el-button>
                    <el-button
                      v-if="!scoped.row.isSet"
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="
                        container_env_del(
                          application_form.pod.spec.containers[0].env,
                          scoped.$index
                        )
                      "
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="卷" prop="volumes">
                <el-button
                  size="small"
                  icon="el-icon-circle-plus"
                  @click="add_volumes"
                ></el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="卷挂载" prop="volumeMounts">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="挂载卷"
                  placement="top"
                >
                  <el-button
                    size="small"
                    icon="el-icon-circle-plus"
                    @click="add_container_volumeMounts"
                  ></el-button>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row
            v-if="
              application_form.pod.spec.containers[0].volumeMounts.length > 0
            "
          >
            <el-form-item>
              <el-table
                :data="application_form.pod.spec.containers[0].volumeMounts"
                size="mini"
                border
              >
                <el-table-column label="name" prop="name">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.name"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.name"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="mountPath" prop="mountPath">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.mountPath"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.mountPath"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="subPath" prop="subPath">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.subPath"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.subPath"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                  <template slot-scope="scoped">
                    <el-button
                      type="primary"
                      size="mini"
                      :icon="
                        scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                      "
                      @click="
                        container_volumeMounts_edit(
                          scoped.row,
                          scoped.row.isSet
                        )
                      "
                    ></el-button>
                    <el-button
                      v-if="!scoped.row.isSet"
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="
                        container_volumeMounts_del(
                          application_form.pod.spec.containers[0].volumeMounts,
                          scoped.$index
                        )
                      "
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="Service" name="Service">
          <el-row>
            <el-col :span="12">
              <el-form-item label="类型" prop="type">
                <el-select
                  v-model="application_form.service.spec.type"
                  placeholder=""
                >
                  <el-option label="ClusterIP" value="ClusterIP"></el-option>
                  <el-option label="NodePort" value="NodePort"></el-option>
                  <el-option
                    label="LoadBalancer"
                    value="LoadBalancer"
                  ></el-option>
                  <el-option
                    label="ExternalName"
                    value="ExternalName"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="选择器" prop="selector">
                <el-button
                  size="small"
                  icon="el-icon-circle-plus"
                  @click="add_selector"
                ></el-button>
                <el-tag
                  v-for="tag in showKV(application_form.service.spec.selector)"
                  :key="tag.label"
                  closable
                  @close="close_service_selector(tag.label)"
                  >{{ tag.label }}:{{ tag.value }}</el-tag
                >
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="端口" prop="ports">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="添加端口"
                  placement="top"
                >
                  <el-button
                    size="small"
                    icon="el-icon-circle-plus"
                    @click="add_service_ports"
                  ></el-button>
                </el-tooltip>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="application_form.service.spec.ports.length > 0">
            <el-form-item>
              <el-table
                :data="application_form.service.spec.ports"
                size="mini"
                border
              >
                <el-table-column label="名称" prop="name">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.name"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.name"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="协议" prop="protocol">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.protocol"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.protocol"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="端口" prop="port">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.port"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.port"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="目标端口" prop="targetPort">
                  <template slot-scope="scoped">
                    <el-input
                      v-if="scoped.row.isSet"
                      v-model="scoped.row.targetPort.intVal"
                      size="mini"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scoped.row.targetPort.intVal"
                      size="mini"
                      disabled
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                  <template slot-scope="scoped">
                    <el-button
                      type="primary"
                      size="mini"
                      :icon="
                        scoped.row.isSet ? 'el-icon-check' : 'el-icon-edit'
                      "
                      @click="service_port_edit(scoped.row, scoped.row.isSet)"
                    ></el-button>
                    <el-button
                      v-if="!scoped.row.isSet"
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      @click="
                        service_port_del(
                          application_form.service.spec.ports,
                          scoped.$index
                        )
                      "
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
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
          service: {
            spec: {
              selector: {},
              type: "",
              clusterIP: "",
              ports: [],
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
    add_container_ports() {
      this.application_form.pod.spec.containers[0].ports.push({
        isSet: false,
        name: "",
        protocol: "TCP",
        containerPort: 80,
      });
    },
    container_port_edit(row, isSet) {
      row.isSet = !isSet;
    },
    container_port_del(allData, index) {
      allData.splice(index, 1);
    },
    add_container_env() {
      this.application_form.pod.spec.containers[0].env.push({
        isSet: false,
        name: "",
        value: "",
      });
    },
    container_env_edit(row, isSet) {
      row.isSet = !isSet;
    },
    container_env_del(allData, index) {
      allData.splice(index, 1);
    },
    add_volumes() {},
    add_container_volumeMounts() {
      this.application_form.pod.spec.containers[0].volumeMounts.push({
        isSet: false,
        name: "",
        mountPath: "",
        subPath: "",
      });
    },
    container_volumeMounts_edit(row, isSet) {
      row.isSet = !isSet;
    },
    container_volumeMounts_del(allData, index) {
      allData.splice(index, 1);
    },
    add_selector() {},
    showKV(ans) {
      let tags = [];
      for (let key in ans) {
        tags.push({
          label: key,
          value: ans[key],
        });
      }
      return tags;
    },
    close_service_selector() {},
    add_service_ports() {
      this.application_form.service.spec.ports.push({
        isSet: false,
        name: "",
        port: 80,
        protocol: "TCP",
        targetPort: {
          intVal: 80,
        },
      });
    },
    service_port_edit(row, isSet) {
      row.isSet = !isSet;
    },
    service_port_del(allData, index) {
      allData.splice(index, 1);
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
