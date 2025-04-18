<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-title">用户管理系统</div>
      <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input style="width: 150px" v-model="loginForm.captcha" placeholder="请输入验证码"></el-input>
            <VerifyCode ref="verifyCodeRef" @update:code="captchaCode = $event"/>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script setup>
import {ref, reactive, onMounted} from 'vue';
import {useStore} from 'vuex';
import {useRouter, useRoute} from 'vue-router';
import {ElMessage} from 'element-plus';
import VerifyCode from '@/components/VerifyCode.vue';


const store = useStore();
const router = useRouter();
const route = useRoute();

const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
});

const loginRules = {
  username: [{required: true, message: '请输入用户名', trigger: 'blur'}],
  password: [{required: true, message: '请输入密码', trigger: 'blur'}],
  captcha: [{required: true, message: '请输入验证码', trigger: 'blur'}]
};

const loginFormRef = ref(null);
const verifyCodeRef = ref(null);
const loading = ref(false);
const captchaCode = ref('');

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (!valid) {
      return false;
    }

    // 验证码校验
    if (loginForm.captcha.toLowerCase() !== captchaCode.value) {
      ElMessage.error('验证码错误');
      verifyCodeRef.value.refreshCode();
      return false;
    }

    loading.value = true;
    store.dispatch('login', loginForm)
        .then(() => {
          const redirectPath = route.query.redirect || '/dashboard';
          router.push(redirectPath);
          ElMessage.success('登录成功');
        })
        .catch(() => {
          verifyCodeRef.value.refreshCode();
        })
        .finally(() => {
          loading.value = false;
        });
  });
};

const goToRegister = () => {
  router.push('/register');
};

onMounted(() => {
  // 如果已经登录，跳转到首页
  if (store.state.token) {
    router.push('/dashboard');
  }
});


</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  background-color: #fff;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-container .el-input {
  margin-right: 10px;
}
</style>