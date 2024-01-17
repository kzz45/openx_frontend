<template>
  <div>
    <el-form
      ref="spec_form_refs"
      :model="spec_form"
      size="small"
      label-width="80px"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="副本">
            <el-input v-model="spec_form.replicas" placeholder=""></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="选择器">
            <el-button size="small" icon="el-icon-plus"></el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    spec_form: {
      type: Object,
      default: function () {
        return {};
      },
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
