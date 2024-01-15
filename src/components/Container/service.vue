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
          <el-form-item label="服务类型">
            <el-select v-model="app_form.svc_type" filterable>
              <el-option label="ClusterIP" value="ClusterIP"></el-option>
              <el-option label="NodePort" value="NodePort"></el-option>
              <el-option label="LoadBalancer" value="LoadBalancer"></el-option>
              <el-option label="ExternalName" value="ExternalName"></el-option>
            </el-select> </el-form-item
        ></el-col>
        <el-col :span="12">
          <el-form-item label="端口协议">
            <el-select v-model="app_form.svc_port_protocol" filterable>
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="源端口">
            <el-input v-model="app_form.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="目标端口">
            <el-input v-model="app_form.name" placeholder=""></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Service",
  data() {
    return {
      app_form: {},
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

.el-table {
  width: 100%;
  margin-top: 10px;
}

.el-button {
  vertical-align: top;
}
</style>
