<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="card-header">
              <span>欢迎使用用户管理系统</span>
            </div>
          </template>
          <div class="welcome-content">
            <h2>您好，{{ userInfo?.realName || '用户' }}！</h2>
            <p>当前时间: {{ currentTime }}</p>
            <p v-if="isAdmin">您具有管理员权限，可以查看所有用户信息</p>
            <p v-else>您可以在个人信息页面查看并管理您的信息</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>个人信息概览</span>
              <el-button class="button" text @click="goToProfile">查看详情</el-button>
            </div>
          </template>
          <div v-if="userInfo" class="info-overview">
            <div class="info-item">
              <span class="label">用户名:</span>
              <span class="value">{{ userInfo.username }}</span>
            </div>
            <div class="info-item">
              <span class="label">姓名:</span>
              <span class="value">{{ userInfo.realName }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别:</span>
              <span class="value">{{ userInfo.gender === 1 ? '男' : '女' }}</span>
            </div>
            <div class="info-item">
              <span class="label">年龄:</span>
              <span class="value">{{ userInfo.age }}</span>
            </div>
            <div class="info-item">
              <span class="label">电话:</span>
              <span class="value">{{ userInfo.phone }}</span>
            </div>
          </div>
          <div v-else class="loading-placeholder">
            <el-skeleton :rows="5" animated/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>教育背景概览</span>
            </div>
          </template>
          <div v-if="userInfo && userInfo.educationList && userInfo.educationList.length > 0" class="edu-overview">
            <div v-for="(edu, index) in userInfo.educationList" :key="index" class="edu-item">
              <div class="edu-title">{{ edu.school }} - {{ edu.major }}</div>
              <div class="edu-period">{{ formatDate(edu.startDate) }} 至 {{
                  edu.endDate ? formatDate(edu.endDate) : '至今'
                }}
              </div>
            </div>
          </div>
          <div v-else-if="userInfo && (!userInfo.educationList || userInfo.educationList.length === 0)"
               class="empty-placeholder">
            <el-empty description="暂无教育背景信息"/>
          </div>
          <div v-else class="loading-placeholder">
            <el-skeleton :rows="3" animated/>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20" v-if="isAdmin">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户统计信息</span>
              <el-button class="button" text @click="goToUserList">查看用户列表</el-button>
            </div>
          </template>
          <div class="admin-info">
            <p>作为管理员，您可以查看系统中所有用户的信息。</p>
            <p>点击"查看用户列表"按钮进入用户管理页面。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {ref, computed, onMounted} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import {getUserInfo} from '@/api/user';

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore();
    const router = useRouter();
    const currentTime = ref(new Date().toLocaleString());

    const userInfo = computed(() => store.state.userInfo);
    const isAdmin = computed(() => store.getters.isAdmin);

    const fetchUserInfo = async () => {
      if (!store.state.userInfo) {
        try {
          await store.dispatch('getUserInfo');
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const goToProfile = () => {
      router.push('/profile');
    };

    const goToUserList = () => {
      router.push('/users');
    };

    // 更新当前时间
    const updateTime = () => {
      currentTime.value = new Date().toLocaleString();
    };

    onMounted(() => {
      fetchUserInfo();
      // 每秒更新一次时间
      setInterval(updateTime, 1000);
    });

    return {
      currentTime,
      userInfo,
      isAdmin,
      formatDate,
      goToProfile,
      goToUserList,
    };
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-card {
  background-color: #ecf5ff;
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
}

.info-overview, .edu-overview {
  padding: 10px 0;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.label {
  font-weight: bold;
  width: 80px;
}

.value {
  flex: 1;
}

.edu-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.edu-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.edu-period {
  color: #909399;
  font-size: 14px;
}

.loading-placeholder, .empty-placeholder {
  padding: 20px 0;
}

.admin-info {
  padding: 10px 0;
  text-align: center;
}
</style>