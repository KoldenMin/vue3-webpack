// vuex状态管理
import {createStore} from 'vuex';
import {login, getUserInfo} from '@/api/user';
import {getToken, setToken, clearLoginInfo, setUserInfo} from '@/utils/auth';
import {logout} from "@/api/user";
import {ElMessage} from "element-plus";

export default createStore({
    state: {
        token: getToken(),
        userInfo: null
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
        }
    },
    actions: {
        // 用户登录
        login({commit}, userInfo) {
            const {username, password} = userInfo;
            return new Promise((resolve, reject) => {
                login({username: username.trim(), password: password}).then(response => {
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
        }
    }
});