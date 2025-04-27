import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {clearLoginInfo, getToken, setToken, setUserInfo} from "@/utils/auth";
import {getUserInfo, getUserSalt, login, logout, updateUserAvatar} from "@/api/user";
import MD5 from "crypto-js/md5";
import {enc} from "crypto-js";
import {ElMessage} from "element-plus";
import {useEmployeeStore} from "@/store/employeeStore";

export const useUserStore = defineStore('user', () => {
    const token = ref(getToken());
    const userInfo = ref(null);

    const isAdmin = computed(() => userInfo.value && userInfo.value.isAdmin === true);

    // 用户登录
    async function loginAction(userData) {
        const {username, password} = userData;

        try {
            const saltRes = await getUserSalt(username.trim());
            const salt = saltRes.data;
            if (!salt) {
                throw new Error("获取用户信息失败");
            }
            const encryptedPassword = MD5(password + salt).toString(enc.Hex);
            const response = await login({
                username: username.trim(),
                password: encryptedPassword,
            });
            const data = response.data;
            token.value = data.token;
            userInfo.value = data;
            setToken(data.token)
            setUserInfo(data)
        } catch (e) {
            ElMessage.error("登录失败");
            return Promise.reject(e);
        }
    }

    // 获取用户信息
    async function getUserInfoAction() {
        try {
            const response = await getUserInfo();
            const {data} = response;
            if (!data) {
                throw new Error("验证失败，请重新登陆");
            }
            userInfo.value = data;
            token.value = data.token;
            setUserInfo(data)
            setToken(data.token);
            return data;
        } catch (e) {
            return Promise.reject(e)
        }
    }

    // 退出登录
    async function logoutAction() {
        try {
            await logout();
            console.log('后端登出成功')
        } catch (e) {
            console.log('后端登出失败' + e)
        } finally {
            token.value = null
            userInfo.value = null
            clearLoginInfo()
        }
    }

    // 更新头像
    async function updateAvatarAction(formData) {
        formData.append('userId', userInfo.value.id)
        try {
            const response = await updateUserAvatar(formData)
            if (response.code === 200) {
                // 更新本地头像url
                if (userInfo.value) {
                    userInfo.value.avatar = response.data.avatarUrl
                }
                return response.data
            } else {
                throw new Error(response.data.message || '头像更新失败')
            }
        } catch (e) {
            return Promise.reject(e)
        }
    }

    return {
        userInfo,
        token,
        loginAction,
        isAdmin,
        getUserInfoAction,
        logoutAction,
        updateAvatarAction
    }

})