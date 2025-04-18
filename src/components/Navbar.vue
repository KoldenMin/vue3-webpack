<script setup>
import {computed, ref} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';

const store = useStore();
const router = useRouter();

const userInfo = computed(() => store.state.userInfo);
const isAdmin = computed(() => store.getters.isAdmin);
const avatarUrl = computed(() => {
  // if (userInfo.value.token) {
  //   store.commit('SET_TOKEN', userInfo.value.token);
  // }
  if (!userInfo.value?.avatar) return '';
  // 如果头像路径已经是完整URL，则直接返回
  if (userInfo.value.avatar.startsWith('http')) {
    return userInfo.value.avatar;
  }
  return 'http://localhost:8080/api' + userInfo.value.avatar
});

// 用于头像上传的引用
const avatarInput = ref(null);

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout').then(() => {
      router.push('/login');
    });
  } else if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'change-avatar') {
    // 触发文件选择
    avatarInput.value.click();
  }
}

// 处理头像上传
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('请上传JPG、PNG或GIF格式的图片');
    return;
  }

  // 检查文件大小（限制为2MB）
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }

  // 创建表单数据
  const formData = new FormData();
  formData.append('avatar', file);

  // 调用更新头像的action
  store.dispatch('updateAvatar', formData)
      .then(() => {
        ElMessage.success('头像更新成功');
      })
      .catch(error => {
        ElMessage.error('头像更新失败: ' + (error.message || '未知错误'));
      });

  // 清空文件输入，以便再次选择同一文件
  e.target.value = '';
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
        <div class="avatar-container">
          <img :src="avatarUrl" alt="用户头像" class="user-avatar"/>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="change-avatar">更换头像</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 隐藏的文件输入用于上传头像 -->
      <input
          ref="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          class="hidden-input"
          @change="handleAvatarChange"
      />
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
  position: relative;
}

.avatar-container {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  background-color: #f5f7fa;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.hidden-input {
  display: none;
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

  .user-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>