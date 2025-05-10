<template>
  <div class="common-layout">
    <el-container class="layout-container">
      <el-header>
        <div class="header-content">
          <el-avatar :size="32" :src=logo />
          <span class="header-title">
            <span class="italic-text">TimeSync</span>
            <span> For NJU</span>
          </span>
          <div class="header-right">
            <el-button type="warning" @click="handleResetCache">
              <el-icon>
                <Refresh />
              </el-icon>
              如遇页面卡顿，点我重置缓存并强制刷新
            </el-button>
          </div>
        </div>
      </el-header>
      <el-container class="main-container">
        <el-aside width="200px">
          <el-menu :default-active="selectedIndex" @select="selected" router background-color="#545c64"
            text-color="#fff" active-text-color="#ffd04b" style="width: 200px;">
            <el-menu-item index="/">
              <el-icon>
                <HomeFilled />
              </el-icon>
              <template #title>主页</template>
            </el-menu-item>
            <el-menu-item index="/person">
              <el-icon>
                <User />
              </el-icon>
              <template #title>人员管理</template>
            </el-menu-item>
            <el-menu-item index="/upload">
              <el-icon>
                <Edit />
              </el-icon>
              <template #title>录入日程</template>
            </el-menu-item>
            <el-menu-item index="/query">
              <el-icon>
                <Search />
              </el-icon>
              <template #title>预定日程</template>
            </el-menu-item>

          </el-menu>
        </el-aside>
        <el-container class="right-container">
          <el-main>
            <router-view></router-view>
          </el-main>
          <el-footer>©All Rights Reserved</el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Search, Edit, HomeFilled, User, Refresh } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useEventsStore } from './stores/events'
import logo from "@/assets/logo.png"
const route = useRoute()
const selectedIndex = ref(route.path)
const eventsstore = useEventsStore()

const selected = (index) => {
  console.log("selected route:", index)
}

const handleResetCache = () => {
  // 清除所有 Pinia 持久化存储
  let piniaPrefix = 'events';
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(piniaPrefix)) {
      localStorage.removeItem(key);
    }
  });
  piniaPrefix = 'personGroup';
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(piniaPrefix)) {
      localStorage.removeItem(key);
    }
  });
  piniaPrefix = 'query';
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(piniaPrefix)) {
      localStorage.removeItem(key);
    }
  });
  // 强制刷新页面
  window.location.reload();
}

// 在组件挂载时获取人员列表和组列表
onMounted(() => {
  eventsstore.loop_get_updating_events()
})

// 在组件卸载时停止 loop_get_updating_events 函数
onUnmounted(() => {
  clearInterval(eventsstore.loop_get_updating_events)
})
</script>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
}

.layout-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.el-header {
  background-color: #824082;
  color: white;
  line-height: 60px;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  position: relative;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.italic-text {
  font-style: italic;
}

.header-right {
  position: absolute;
  right: 0;
}

.header-right .el-button {
  margin-right: 16px;
  background-color: #824082;
  border-color: #824082;
}

.header-right .el-button:hover {
  transform: translateY(-1px);
}

.el-aside {
  background-color: #545c64;
  height: 100%;
}

.el-main {
  /* background-color: #f5f7fa; */
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.el-footer {
  background-color: #824082;
  color: white;
  text-align: center;
  line-height: 60px;
  height: 60px;
}

/* 确保菜单填满整个侧边栏 */
.el-menu {
  height: 100%;
  border-right: none;
}
</style>
