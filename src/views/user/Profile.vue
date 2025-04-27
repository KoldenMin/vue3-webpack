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
                  v-for="(edu, id) in userInfo.educationList"
                  :key="id"
                  :timestamp="getEducationPeriod(edu)"
                  placement="top"
              >
                <el-card>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                    <div class="education-header">
                      <h4>{{ edu.school }} - {{ edu.major }}</h4>
                    </div>
                    <div>
                      <el-popconfirm title="确认删除这段经历？" @confirm="handleDeleteEducation(edu.id)">
                        <template #reference>
                          <el-button type="danger" size="small">删除经历</el-button>
                        </template>
                      </el-popconfirm>
                    </div>
                  </div>
                  <p v-if="edu.degree">学位: {{ edu.degree }}</p>
                  <p v-if="edu.description">{{ edu.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无教育背景信息"/>
        </div>

        <el-divider/>

        <div class="profile-section">
          <div class="section-header">
            <h3>个人简历</h3>
            <el-button
                v-if="userInfo.resumeUrl"
                type="success"
                size="small"
                @click="viewResume"
            >
              查看简历
            </el-button>
          </div>
          <div class="info-grid">
            <el-upload
                class="resume-upload"
                drag
                :action="null"
                :http-request="handleResumeUpload"
                :before-upload="beforeResumeUpload"
                :on-success="handleResumeSuccess"
                :on-error="handleResumeError"
                :show-file-list="true"
                :limit="1"
                :file-list="resumeFileList"
            >
              <el-icon class="el-icon--upload">
                <upload-filled/>
              </el-icon>
              <div class="el-upload__text">
                拖动文件或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传pdf、doc、docx格式的简历，且不超过10MB
                </div>
              </template>
            </el-upload>

            <div v-if="userInfo.resumeUrl" class="resume-info full-width">
              <div class="resume-status">
                <el-tag type="success">已上传简历</el-tag>
                <span class="resume-filename">{{ getResumeFileName(userInfo.resumeUrl) }}</span>
              </div>
            </div>
          </div>
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
import {onMounted, reactive, ref} from 'vue';
import {ElMessage} from 'element-plus';
import {getUserInfo, updateUser, uploadResume} from '@/api/user';
import {addEducation, delEducationById, getEducationList} from '@/api/education';
import {UploadFilled} from '@element-plus/icons-vue'


const loading = ref(true);
const userInfo = ref({});
const dialogVisible = ref(false);
const userDialogVisible = ref(false);
const submitting = ref(false);
const educationFormRef = ref(null);
const userInfoFormRef = ref(null);
const resumeUploading = ref(false);
const resumeFileList = ref([]);

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

const validateEndDate = (rule, value, callback) => {
  if (value && educationForm.startDate) {
    if (new Date(value) < new Date(educationForm.startDate)) {
      callback(new Error('结束日期不能早于开始日期'));
    } else {
      callback();
    }
  } else {
    callback();
  }
};

const educationRules = {
  school: [{required: true, message: '请输入学校名称', trigger: 'blur'}],
  major: [{required: true, message: '请输入专业', trigger: 'blur'}],
  startDate: [{required: true, message: '请选择开始日期', trigger: 'change'}],
  endDate: [
    {validator: validateEndDate, trigger: 'change'}
  ]
};


const userInfoRules = {
  password: [{min: 2, max: 20, message: '密码长度必须在2-20个字符之间', trigger: 'blur'}],
  realName: [{message: '请输入真实姓名', trigger: 'blur'}],
  phone: [{pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur'}]
};

// 删除教育背景信息
const handleDeleteEducation = async (id) => {
  try {
    await delEducationById(id)
    // 重新获取教育背景列表
    await fetchUserData();
  } catch (error) {
    console.error('删除教育背景失败:', error);
  }
}


// 获取用户信息及教育背景
const fetchUserData = async () => {
  loading.value = true;
  try {
    // 获取用户信息
    const userResponse = await getUserInfo();
    userInfo.value = userResponse.data;
    // 如果返回token,更新token
    // if (userInfo.value.token) {
    //   store.commit('SET_TOKEN', userInfo.value.token);
    // }
    // 如果用户已有简历，更新文件列表
    if (userInfo.value.resumeUrl) {
      resumeFileList.value = [{
        name: getResumeFileName(userInfo.value.resumeUrl),
        url: userInfo.value.resumeUrl
      }];
    } else {
      resumeFileList.value = [];
    }

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

// 简历上传前的验证
const beforeResumeUpload = (file) => {
  const isPDF = file.type === 'application/pdf';
  const isDOC = file.type === 'application/msword';
  const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isValidType = isPDF || isDOC || isDOCX;

  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isValidType) {
    ElMessage.error('简历只能是PDF/DOC/DOCX格式!');
    return false;
  }

  if (!isLt10M) {
    ElMessage.error('简历大小不能超过10MB!');
    return false;
  }

  return true;
};

// 处理简历上传
const handleResumeUpload = async (options) => {
  const {file} = options;
  resumeUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('resume', file);

    // 获取当前用户ID
    const userResponse = await getUserInfo();
    const userId = userResponse.data.id;
    formData.append('userId', userId);

    const response = await uploadResume(formData);
    options.onSuccess(response);
  } catch (error) {
    console.error('简历上传失败:', error);
    options.onError(error);
  } finally {
    resumeUploading.value = false;
  }
};

// 简历上传成功的回调
const handleResumeSuccess = (response) => {
  ElMessage.success('简历上传成功');
  fetchUserData(); // 重新获取用户数据，包括最新的简历URL
};

// 简历上传失败的回调
const handleResumeError = (error) => {
  console.error('简历上传错误:', error);
  ElMessage.error('简历上传失败');
};

// 获取简历文件名
const getResumeFileName = (url) => {
  if (!url) return '';
  return url.split('/').pop();
};

// 查看简历
const viewResume = () => {
  // if (userInfo.value.token) {
  //   store.commit('SET_TOKEN', userInfo.value.token);
  // }
  if (userInfo.value.resumeUrl) {
    // 构建完整的URL路径，根据您的项目配置可能需要调整
    const baseUrl = 'http://localhost:8080/api';
    window.open(baseUrl + userInfo.value.resumeUrl, '_blank');
  } else {
    ElMessage.warning('暂无简历可查看');
  }
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

.resume-upload {
  width: 100%;
}

.resume-info {
  margin-top: 15px;
}

.resume-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.resume-filename {
  color: #606266;
  font-size: 14px;
}
</style>