import request from '@/utils/request';

// 获取教育背景列表
export function getEducationList() {
    return request({
        url: '/education/list',
        method: 'get'
    });
}

// 添加教育背景
export function addEducation(data) {
    return request({
        url: '/education/add',
        method: 'post',
        data
    });
}