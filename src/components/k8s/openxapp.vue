<template>
  <div>
    <el-form
      ref="app_form_refs"
      :model="app_form"
      size="small"
      label-width="100px"
    >
      <el-tabs v-model="app_form_tabs">
        <el-tab-pane label="Spec" name="spec">
          <el-row>
            <el-col :span="12">
              <el-form-item label="appName" prop="appName">
                <el-input v-model="app_form.appName"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="replicas" prop="replicas">
                <el-input-number
                  v-model="app_form.replicas"
                  :min="0"
                  :max="10"
                  style="width: 200px"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="更新策略" prop="watchPolicy">
                <el-select v-model="app_form.watchPolicy">
                  <el-option label="手动更新" value="manual"></el-option>
                  <el-option
                    label="滚动更新"
                    value="rolling-upgrade"
                  ></el-option>
                  <el-option
                    label="自动更新"
                    value="In-place-upgrade"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12"></el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="Pod" name="pod"></el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    app_form: {
      type: Object,
      default: () => {},
    },
  },
  watch: {
    app_form: {
      handler(newVal) {
        // console.log(newVal, "============");
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      openx_app_form: {
        spec: {
          appName: "",
          replicas: 0,
          watchPolicy: "manual",
        },
      },
      app_form_tabs: "spec",
    };
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
