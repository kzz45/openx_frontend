<template>
  <el-table
    :data="alb_list"
    size="small"
    empty-text="啥也没有"
    border
  ></el-table>
</template>

<script>
export default {
  data() {
    return {
      alb_list: [],
    };
  },
};
</script>
