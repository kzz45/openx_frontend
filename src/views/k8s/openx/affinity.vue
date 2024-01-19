<template>
  <el-table
    :data="affinity_list"
    size="small"
    empty-text="啥也没有"
    border
  ></el-table>
</template>

<script>
export default {
  data() {
    return {
      affinity_list: [],
    };
  },
};
</script>
