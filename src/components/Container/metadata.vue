<template>
  <div>
    <el-form
      ref="app_form_refs"
      :model="app_form"
      size="small"
      label-width="100px"
    >
      <el-row>
        <el-col :span="12"
          ><el-form-item label="应用名称"
            ><el-input
              v-model="app_form.name"
              placeholder=""
            ></el-input></el-form-item
        ></el-col>
        <el-col :span="12"
          ><el-form-item label="命名空间">
            <el-input
              v-model="app_form.name"
              placeholder=""
            ></el-input></el-form-item
        ></el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="注解">
            <el-button
              size="mini"
              icon="el-icon-circle-plus"
              style="vertical-align: middle"
              @click="create_kv"
            ></el-button></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="标签">
            <el-button
              size="mini"
              icon="el-icon-circle-plus"
              style="vertical-align: middle"
              @click="create_kv"
            ></el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="副本数量">
            <el-input-number
              v-model="app_form.num"
              :min="0"
              :max="10"
            ></el-input-number></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="更新策略">
            <el-select v-model="app_form.update_policy" filterable>
              <el-option label="手动更新" value="manual"></el-option>
              <el-option label="原地更新" value="in-place-update"></el-option>
              <el-option label="滚动更新" value="rolling-update"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="负载均衡"></el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="访问控制"></el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "Metadata",
  data() {
    return {
      app_form: {},
    };
  },
  methods: {
    create_kv() {},
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
