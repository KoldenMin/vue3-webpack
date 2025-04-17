<script setup>
import {computed} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';

const store = useStore();
const router = useRouter();

const userInfo = computed(() => store.state.userInfo);
const isAdmin = computed(() => store.getters.isAdmin);

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout').then(() => {
      router.push('/login');
    });
  } else if (command === 'profile') {
    router.push('/profile');
  }
}


</script>

<template>
  <div class="navbar">
    <div class="logo">用户管理系统</div>
    <div class="menu">
      <router-link to="/dashboard" class="menu-item">首页</router-link>
      <router-link to="/profile" class="menu-item">个人信息</router-link>
      <router-link v-if="isAdmin" to="/users" class="menu-item">用户列表</router-link>
    </div>
    <div class="user-info">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-name">
          {{ userInfo?.realName || '用户' }} <i class="el-icon-arrow-down"></i>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409EFF;
}

.menu {
  display: flex;
  gap: 20px;
}

.menu-item {
  text-decoration: none;
  color: #606266;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

.router-link-active {
  color: #409EFF;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #303133;
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.user-name:hover {
  background-color: #f5f7fa;
}

.el-icon-arrow-down {
  margin-left: 4px;
  font-size: 12px;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 10px;
  }

  .menu {
    gap: 10px;
  }

  .menu-item {
    padding: 6px 8px;
    font-size: 13px;
  }

  .logo {
    font-size: 18px;
  }
}
</style>