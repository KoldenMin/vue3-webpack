// vuex状态管理
import {createStore} from 'vuex';
import {login, getUserInfo, getUserSalt, updateUserAvatar} from '@/api/user';
import {getToken, setToken, clearLoginInfo, setUserInfo} from '@/utils/auth';
import {logout} from "@/api/user";
import MD5 from 'crypto-js/md5';
import {enc} from 'crypto-js';
import {ElMessage} from "element-plus";

export default createStore({
    state: {
        token: getToken(), userInfo: null
    },
    getters: {
        isAdmin: state => {
            return state.userInfo && state.userInfo.isAdmin === true;
        }
    },
    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token;
        },
        SET_USER_INFO: (state, userInfo) => {
            state.userInfo = userInfo;
        },
        CLEAR_LOGIN_INFO: (state) => {
            state.token = null;
            state.userInfo = null;
        },
        // 更新用户头像
        UPDATE_AVATAR(state, avatarUrl) {
            if (state.userInfo) {
                state.userInfo.avatar = avatarUrl;
            }
        }
    },
    actions: {
        // 用户登录
        login({commit}, userInfo) {
            const {username, password} = userInfo;
            return new Promise((resolve, reject) => {
                getUserSalt(username.trim()).then(saltRes => {
                    const salt = saltRes.data
                    console.log(salt + '@@@@');
                    if (!salt) {
                        reject('获取用户信息失败');
                        return;
                    }
                    const encryptedPassword = MD5(password + salt).toString(enc.Hex);
                    console.log(encryptedPassword);
                    login({username: username.trim(), password: encryptedPassword}).then(response => {
                        // const {data} = response;
                        const data = response.data;
                        commit('SET_TOKEN', data.token);
                        commit('SET_USER_INFO', data);
                        setToken(data.token);
                        setUserInfo(data);
                        resolve();
                    }).catch(error => {
                        ElMessage.error("登录失败")
                        reject(error);
                    });
                })
            });
        },

        // 获取用户信息
        getUserInfo({commit, state}) {
            return new Promise((resolve, reject) => {
                getUserInfo().then(response => {
                    const {data} = response;
                    if (!data) {
                        reject('验证失败，请重新登录。');
                    }
                    commit('SET_USER_INFO', data);
                    setUserInfo(data);
                    resolve(data);
                }).catch(error => {
                    reject(error);
                });
            });
        },

        // 退出登录
        logout({commit}) {
            return new Promise(resolve => {
                logout().then(() => {
                    console.log('后端登出成功');
                }).catch(error => {
                    console.log('后端登出请求失败', error);
                }).finally(() => {
                    commit('CLEAR_LOGIN_INFO');
                    clearLoginInfo();
                    resolve();
                })
            });
        },

        // 更新头像
        updateAvatar({commit, state}, formData) {
            formData.append('userId', state.userInfo.id);

            return new Promise((resolve, reject) => {
                updateUserAvatar(formData).then(response => {
                    if (response.code === 200) {
                        // 更新本地 state 中的头像 URL
                        commit('UPDATE_AVATAR', response.data.avatarUrl);
                        resolve(response.data);
                    } else {
                        reject(new Error(response.data.message || '头像更新失败'));
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        }
    }
});