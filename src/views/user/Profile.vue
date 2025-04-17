<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleClick">更改信息</el-button>
          <el-dialog
              v-model="userDialogVisible"
              title="更改用户信息"
              width="500px"
              :close-on-click-modal="false"
          >
            <el-form
                ref="userInfoFormRef"
                :model="userInfoForm"
                :rules="userInfoRules"
                label-width="100px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="userInfoForm.username" disabled/>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input v-model="userInfoForm.password" placeholder="请输入新密码"/>
              </el-form-item>
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="userInfoForm.realName" placeholder="请输入真实姓名"/>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="userInfoForm.phone" placeholder="请输入手机号"/>
              </el-form-item>


            </el-form>

            <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleUserInfoFormDel">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitUserInfo">确定</el-button>
        </span>
            </template>
          </el-dialog>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated/>

      <div v-else class="profile-content">
        <div class="profile-section">
          <h3>基本信息</h3>
          <div class="info-grid">
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
            <div class="info-item">
              <span class="label">住址:</span>
              <span class="value">{{ userInfo.currentAddress || '未填写' }}</span>
            </div>
          </div>
        </div>

        <el-divider/>

        <div class="profile-section">
          <h3>工作信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">入职时间:</span>
              <span class="value">{{ userInfo.entryTime ? formatDate(userInfo.entryTime) : '未填写' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">职能描述:</span>
              <span class="value">{{ userInfo.jobDescription || '未填写' }}</span>
            </div>
          </div>
        </div>

        <el-divider/>

        <div class="profile-section">
          <div class="section-header">
            <h3>教育背景</h3>
            <el-button type="primary" size="small" @click="showAddEducationDialog">添加教育背景</el-button>
          </div>

          <div v-if="userInfo.educationList && userInfo.educationList.length > 0">
            <el-timeline>
              <el-timeline-item
                  v-for="(edu, index) in userInfo.educationList"
                  :key="index"
                  :timestamp="getEducationPeriod(edu)"
                  placement="top"
              >
                <el-card>
                  <h4>{{ edu.school }} - {{ edu.major }}</h4>
                  <p v-if="edu.degree">学位: {{ edu.degree }}</p>
                  <p v-if="edu.description">{{ edu.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无教育背景信息"/>
        </div>
      </div>
    </el-card>

    <!-- 添加教育背景对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="添加教育背景"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="educationFormRef"
          :model="educationForm"
          :rules="educationRules"
          label-width="100px"
      >
        <el-form-item label="学校" prop="school">
          <el-input v-model="educationForm.school" placeholder="请输入学校名称"/>
        </el-form-item>

        <el-form-item label="专业" prop="major">
          <el-input v-model="educationForm.major" placeholder="请输入专业"/>
        </el-form-item>

        <el-form-item label="学位" prop="degree">
          <el-select v-model="educationForm.degree" placeholder="请选择学位">
            <el-option label="学士" value="学士"/>
            <el-option label="硕士" value="硕士"/>
            <el-option label="博士" value="博士"/>
            <el-option label="其他" value="其他"/>
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
              v-model="educationForm.startDate"
              type="date"
              placeholder="选择开始日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
              v-model="educationForm.endDate"
              type="date"
              placeholder="选择结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="educationForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入教育经历描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submitEducation">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue';
import {useStore} from 'vuex';
import {ElMessage} from 'element-plus';
import {getUserInfo, updateUser} from '@/api/user';
import {addEducation, getEducationList} from '@/api/education';
import {getToken} from "@/utils/auth.js";
import router from "@/router/index.js";
import axios from "axios";


const store = useStore();
const loading = ref(true);
const userInfo = ref({});
const dialogVisible = ref(false);
const userDialogVisible = ref(false);
const submitting = ref(false);
const educationFormRef = ref(null);
const userInfoFormRef = ref(null);

const educationForm = reactive({
  school: '',
  major: '',
  degree: '',
  startDate: '',
  endDate: '',
  description: ''
});

const userInfoForm = reactive({
  username: '',
  password: '',
  realName: '',
  phone: ''
});

const educationRules = {
  school: [{required: true, message: '请输入学校名称', trigger: 'blur'}],
  major: [{required: true, message: '请输入专业', trigger: 'blur'}],
  startDate: [{required: true, message: '请选择开始日期', trigger: 'change'}]
};

const userInfoRules = {
  password: [{min: 2, max: 20, message: '密码长度必须在2-20个字符之间', trigger: 'blur'}],
  realName: [{message: '请输入真实姓名', trigger: 'blur'}],
  phone: [{pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur'}]
};


// 获取用户信息及教育背景
const fetchUserData = async () => {
  loading.value = true;
  try {
    // 获取用户信息
    console.log('开始获取用户信息，当前 token:', getToken());
    //能进入
    const userResponse = await getUserInfo();
    console.log('userResponse', userResponse);
    console.log('用户ID', userResponse.data.id);
    console.log(getToken())
    userInfo.value = userResponse.data;

    // 获取教育背景列表
    const eduResponse = await getEducationList();
    userInfo.value.educationList = eduResponse.data;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    console.error('错误详情:', error.response ? error.response.data : '无响应数据');
    ElMessage.error('获取用户数据失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取教育经历起止时间
const getEducationPeriod = (edu) => {
  const start = edu.startDate ? formatDate(edu.startDate) : '';
  const end = edu.endDate ? formatDate(edu.endDate) : '至今';
  return `${start} 至 ${end}`;
};

// 显示用户信息对话框
const handleClick = () => {
  userDialogVisible.value = true;
  // 重置表单
  if (userInfoFormRef.value) {
    userInfoFormRef.value.resetFields();
  }
  userInfoForm.username = userInfo.value.username
}

const handleUserInfoFormDel = () => {
  userDialogVisible.value = false;
  userInfoForm.password = ''
  userInfoForm.phone = ''
  userInfoForm.realName = ''
}

// 显示添加教育背景对话框
const showAddEducationDialog = () => {
  dialogVisible.value = true;

  // 重置表单
  if (educationFormRef.value) {
    educationFormRef.value.resetFields();
  }
};

// 提交教育背景
const submitEducation = () => {
  educationFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }

    submitting.value = true;
    try {
      await addEducation(educationForm);
      ElMessage.success('添加教育背景成功');
      dialogVisible.value = false;

      // 重新获取教育背景列表
      fetchUserData();
    } catch (error) {
      console.error('添加教育背景失败:', error);
    } finally {
      submitting.value = false;
    }
  });
};

// 提交用户信息
const submitUserInfo = () => {
  userInfoFormRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }

    submitting.value = true;
    try {
      const userResponse = await getUserInfo();
      const id = userResponse.data.id
      await updateUser(id, userInfoForm);
      ElMessage.success('更新成功');
      userDialogVisible.value = false;

      // 重新获取教育背景列表
      await fetchUserData();
    } catch (error) {
      console.error('更新失败:', error);
    } finally {
      submitting.value = false;
    }
  });
};

onMounted(() => {
  fetchUserData();
});


</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-content {
  padding: 10px;
}

.profile-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
}

.full-width {
  grid-column: span 2;
}

.label {
  font-weight: bold;
  width: 80px;
  flex-shrink: 0;
}

.value {
  flex: 1;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
}

h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
}
</style>