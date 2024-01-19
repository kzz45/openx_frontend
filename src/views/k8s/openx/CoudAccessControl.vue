<template>
  <el-table
    :data="acl_list"
    size="small"
    empty-text="啥也没有"
    border
  ></el-table>
</template>

<script>
export default {
  data() {
    return {
      acl_list: [],
    };
  },
};
</script>
