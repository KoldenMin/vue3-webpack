import axios from 'axios';
import {ElMessage} from 'element-plus';
import {getToken} from './auth';
import router from '@/router';

// 创建axios实例
const service = axios.create({
    baseURL: 'http://localhost:8080/api', // API的base_url
    // timeout: 30000, // 请求超时时间
    withCredentials: true
});

// request拦截器
service.interceptors.request.use(
    config => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            // console.log('完整的Authorization头:', config.headers['Authorization'])
        }
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }
);

// response拦截器
service.interceptors.response.use(
    response => {
        const res = response.data;

        // 如果返回的状态码不是200，判断为错误
        if (res.code !== 200) {
            ElMessage({
                message: res.message || '错误',
                type: 'error',
                duration: 5 * 1000
            });

            // 401: 未登录或token过期
            if (res.code === 401) {
                router.push('/login');
            }

            return Promise.reject(new Error(res.message || '错误'));
        } else {
            return res;
        }
    },
    error => {
        console.log('err: ' + error);
        let message = error.message;

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    message = '未授权，请重新登录';
                    router.push('/login');
                    break;
                case 403:
                    message = '拒绝访问';
                    break;
                case 404:
                    message = '请求错误，未找到该资源';
                    break;
                case 500:
                    message = '服务器端出错';
                    break;
                default:
                    message = error.response.data.message || '系统未知错误';
            }
        }

        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        });

        return Promise.reject(error);
    }
);

export default service;