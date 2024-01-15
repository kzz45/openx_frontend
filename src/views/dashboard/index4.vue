<template>
  <div class="app-container">
    <el-card class="box-card">
      <!-- <el-row>
        <el-col :span="6">
          <el-select
            size="small"
            ref="selectRef"
            v-model="select_value"
            @change="changeSelect"
            filterable
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-col>
      </el-row> -->
      <el-row>
        <el-col>
          <el-table
            :data="
              tableData.filter(
                (data) =>
                  !tableSearch ||
                  data.name.toLowerCase().includes(tableSearch.toLowerCase())
              )
            "
            border
            size="small"
            @row-click="click_row"
            @row-contextmenu="right_click"
          >
            <el-table-column label="名称" prop="name" width="250">
              <template slot="header">
                <span>名称</span>
                <el-input
                  v-model="tableSearch"
                  size="mini"
                  placeholder="关键字搜索"
                  style="margin-left: 10px; width: 150px"
                  autofocus
                ></el-input>
              </template>
            </el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="日期" prop="date"></el-table-column>
            <el-table-column label="操作" width="120px;">
              <template slot-scope="scoped">
                <el-tooltip
                  class="item"
                  effect="dark"
                  content="更多操作"
                  placement="top"
                >
                  <el-dropdown
                    trigger="click"
                    @command="
                      (command) => {
                        handleCommand(command, scoped.row);
                      }
                    "
                  >
                    <el-button type="primary" icon="el-icon-menu" size="small">
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item
                        command="info"
                        icon="el-icon-info"
                        style="color: #909399"
                        >详情</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="export"
                        icon="el-icon-top"
                        style="color: #409eff"
                        >导出</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="export_yaml"
                        icon="el-icon-document"
                        style="color: #67c23a"
                        >YAML</el-dropdown-item
                      >
                      <el-dropdown-item
                        command="delete"
                        icon="el-icon-delete"
                        style="color: #f56c6c"
                        >删除</el-dropdown-item
                      >
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <transition name="fade">
        <div v-if="actionMenu" class="action-menu-pop" :style="actionMenuStyle">
          <div class="td-btns">
            <div class="action-btn detail">详情</div>
            <div class="action-btn detail">加入对比</div>
            <div class="action-btn detail">导出</div>
            <div class="action-btn detail">导出为yaml</div>
            <div class="action-btn delete">删除</div>
          </div>
        </div>
      </transition>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      select_value: "",
      options: [
        { value: "xxx", label: "xxx" },
        { value: "yyy", label: "yyy" },
        { value: "zzz", label: "zzz" },
      ],
      tableData: [
        { name: "xxx", date: "xxx" },
        { name: "yyy", date: "yyy" },
        { name: "zzz", date: "zzz" },
        { name: "aaa", date: "aaa" },
        { name: "bbb", date: "bbb" },
        { name: "ccc", date: "ccc" },
      ],
      tableSearch: "",
      show3: false,
      transition_style: "",
      actionMenu: false,
      actionMenuStyle: "",
    };
  },
  computed: {
    ...mapGetters(["namespace"]),
  },
  watch: {
    select_value(newVal, oldVal) {
      console.log("watch now:", newVal, oldVal);
    },
    namespace: function () {
      // console.log(this.namespace);
      this.$message({ type: "warning", message: this.namespace });
    },
  },
  mounted() {
    // document.addEventListener("keydown", function (e) {
    //   console.log("keydown", e);
    // });
  },
  methods: {
    focusSelect(val) {
      console.log(val);
    },
    changeSelect(val) {
      //   console.log(val);
    },
    handleEdit() {},
    handleDelete() {},
    right_click(row, column, event) {
      event.preventDefault();
      this.actionMenu = true;

      let evt = event;
      let offsetY = 20;
      if (window.innerHeight - event.y <= 220) {
        offsetY = 240;
      }
      this.actionMenuStyle = `top: ${evt.y - offsetY}px;left: ${evt.x - 20}px`;
    },
    click_row() {
      this.actionMenu = false;
    },
    handleCommand(command, row) {
      console.log(command, row);
    },
  },
};
</script>

<style>
.action-menu-pop {
  position: fixed;
  padding: 10px;
  color: red;
  border-radius: 10px;
  z-index: 10;
  background: #fff;
  box-shadow: 3px 3px 15px 5px #cdcfcf;
}

.td-btns {
  display: flex;
  gap: 10px;
  width: 100%;
  flex-wrap: wrap;
  padding: 5px 0px;
  flex-direction: column;
  font-size: 15px;
  font-weight: 500;
  .action-btn {
    width: 130px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    align-items: center;
  }
  .detail {
    &:hover {
      border: 1px solid #202123;
    }
  }
  .delete {
    color: #fff;
    border-color: #ff4d4f;
    background: #ff4d4f;
    &:hover {
      background: #ffffff;
      border: 1px solid #ff4d4f;
      color: #ff4d4f;
    }
  }
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
