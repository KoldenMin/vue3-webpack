<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-title">用户注册</div>
      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="registerForm.realName" placeholder="请输入姓名"/>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="registerForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="registerForm.age" :min="18" :max="100"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号码"/>
        </el-form-item>
        <el-form-item label="当前住址" prop="currentAddress">
          <el-input v-model="registerForm.currentAddress" placeholder="请输入当前住址"/>
        </el-form-item>
        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker
              v-model="registerForm.entryTime"
              type="date"
              placeholder="选择入职日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="职能描述" prop="jobDescription">
          <el-input
              v-model="registerForm.jobDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入职能描述"
          />
        </el-form-item>

        <el-divider content-position="center">教育背景信息</el-divider>

        <div v-for="(edu, index) in registerForm.educationList" :key="index" class="education-item">
          <div class="education-header">
            <h4>教育背景 #{{ index + 1 }}</h4>
            <el-button
                v-if="registerForm.educationList.length > 1"
                type="danger"
                size="small"
                circle
                @click="removeEducation(index)"
            >
              <el-icon>
                <Delete/>
              </el-icon>
            </el-button>
          </div>

          <el-form-item
              :label="'学校'"
              :prop="'educationList.' + index + '.school'"
              :rules="{ required: true, message: '请输入学校名称', trigger: 'blur' }"
          >
            <el-input v-model="edu.school" placeholder="请输入学校名称"/>
          </el-form-item>

          <el-form-item
              :label="'专业'"
              :prop="'educationList.' + index + '.major'"
              :rules="{ required: true, message: '请输入专业', trigger: 'blur' }"
          >
            <el-input v-model="edu.major" placeholder="请输入专业"/>
          </el-form-item>

          <el-form-item :label="'学位'" :prop="'educationList.' + index + '.degree'">
            <el-select v-model="edu.degree" placeholder="请选择学位">
              <el-option label="学士" value="学士"/>
              <el-option label="硕士" value="硕士"/>
              <el-option label="博士" value="博士"/>
              <el-option label="其他" value="其他"/>
            </el-select>
          </el-form-item>

          <el-form-item
              :label="'开始日期'"
              :prop="'educationList.' + index + '.startDate'"
              :rules="{ required: true, message: '请选择开始日期', trigger: 'change' }"
          >
            <el-date-picker
                v-model="edu.startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item :label="'结束日期'" :prop="'educationList.' + index + '.endDate'">
            <el-date-picker
                v-model="edu.endDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item :label="'描述'" :prop="'educationList.' + index + '.description'">
            <el-input
                v-model="edu.description"
                type="textarea"
                :rows="2"
                placeholder="请输入教育经历描述"
            />
          </el-form-item>

          <el-divider v-if="index < registerForm.educationList.length - 1"/>
        </div>

        <el-form-item>
          <el-button type="primary" @click="addEducation">添加教育背景</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleRegister">立即注册</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {ref, reactive} from 'vue';
import {useRouter} from 'vue-router';
import {ElMessage} from 'element-plus';
import {Delete} from '@element-plus/icons-vue';
import {register} from '@/api/user';

export default {
  name: 'Register',
  components: {
    Delete
  },
  setup() {
    const router = useRouter();

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      gender: 1,
      age: 18,
      phone: '',
      currentAddress: '',
      entryTime: '',
      jobDescription: '',
      educationList: [
        {
          school: '',
          major: '',
          degree: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    });

    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else if (value.length < 2) {
        callback(new Error('密码长度不能小于2位'));
      } else {
        if (registerForm.confirmPassword !== '') {
          registerFormRef.value.validateField('confirmPassword');
        }
        callback();
      }
    };

    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };

    const validatePhone = (rule, value, callback) => {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (value && !phoneReg.test(value)) {
        callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    };

    const registerRules = {
      username: [
        {required: true, message: '请输入用户名', trigger: 'blur'},
        {min: 2, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur'}
      ],
      password: [
        {validator: validatePass, trigger: 'blur'}
      ],
      confirmPassword: [
        {validator: validatePass2, trigger: 'blur'}
      ],
      realName: [
        {required: true, message: '请输入姓名', trigger: 'blur'}
      ],
      gender: [
        {required: true, message: '请选择性别', trigger: 'change'}
      ],
      age: [
        {required: true, message: '请输入年龄', trigger: 'blur'},
        {type: 'number', min: 18, max: 100, message: '年龄必须在18到100之间', trigger: 'blur'}
      ],
      phone: [
        {required: true, message: '请输入手机号码', trigger: 'blur'},
        {validator: validatePhone, trigger: 'blur'}
      ]
    };

    const registerFormRef = ref(null);
    const loading = ref(false);

    const addEducation = () => {
      registerForm.educationList.push({
        school: '',
        major: '',
        degree: '',
        startDate: '',
        endDate: '',
        description: ''
      });
    };

    const removeEducation = (index) => {
      registerForm.educationList.splice(index, 1);
    };

    const handleRegister = () => {
      registerFormRef.value.validate((valid) => {
        if (!valid) {
          return false;
        }

        loading.value = true;

        // 处理提交数据
        const formData = {
          username: registerForm.username,
          password: registerForm.password,
          realName: registerForm.realName,
          gender: registerForm.gender,
          age: registerForm.age,
          phone: registerForm.phone,
          currentAddress: registerForm.currentAddress,
          entryTime: registerForm.entryTime,
          jobDescription: registerForm.jobDescription,
          educationList: registerForm.educationList
        };

        register(formData)
            .then(() => {
              ElMessage.success('注册成功，请登录');
              router.push('/login');
            })
            .catch(() => {
              // 错误处理由全局拦截器完成
            })
            .finally(() => {
              loading.value = false;
            });
      });
    };

    const goToLogin = () => {
      router.push('/login');
    };

    return {
      registerForm,
      registerRules,
      registerFormRef,
      loading,
      addEducation,
      removeEducation,
      handleRegister,
      goToLogin
    };
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  padding: 30px 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.register-card {
  width: 600px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #fff;
  margin-bottom: 30px;
}

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
}

.education-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f8f8f8;
  margin-bottom: 20px;
}

.education-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.education-header h4 {
  margin: 0;
  color: #409eff;
}
</style>