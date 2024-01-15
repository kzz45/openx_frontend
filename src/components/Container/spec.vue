<template>
  <div>
    <el-form :model="app_spec">
      <el-form-item label="名称">
        <el-input v-model="app_spec.name"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  props: {
    app_spec: {
      type: Object,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {};
  },
};
</script>
