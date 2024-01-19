<template>
    <el-table
      :data="toleration_list"
      size="small"
      empty-text="啥也没有"
      border
    ></el-table>
  </template>
  
  <script>
  export default {
    data() {
      return {
        toleration_list: [],
      };
    },
  };
  </script>
  