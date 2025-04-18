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

// 根据id删除教育背景
export function delEducationById(id) {
    return request({
        url: '/education/delete/' + id,
        method: 'delete'
    });
}

// 根据用户id删除教育背景
export function delEducationByUserId(userId) {
    return request({
        url: '/education/delete/user/' + userId,
        method: 'delete'
    });
}