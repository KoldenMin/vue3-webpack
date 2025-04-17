import request from '@/utils/request';

// 用户登录
export function login(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data
    });
}

// 用户注册
export function register(data) {
    return request({
        url: '/user/register',
        method: 'post',
        data
    });
}

// 获取当前用户信息
export function getUserInfo() {
    return request({
        url: '/user/info',
        method: 'get'
    });
}

// 获取用户列表（管理员）
export function getUserList() {
    return request({
        url: '/user/list',
        method: 'get'
    });
}

// 用户登出
export function logout() {
    return request({
        url: '/user/logout',
        method: 'post'
    });
}

// 分页
export function getUserPage(pageNum, pageSize, username, realName) {
    return request({
        url: '/user/page',
        method: 'get',
        params: {
            pageNum,
            pageSize,
            username,
            realName
        }
    });
}

// 删除用户
export function deleteUser(id) {
    return request({
        url: '/user/delete/' + id,
        method: 'delete'
    });
}

// 更新用户
export function updateUser(id, updateDTO) {
    return request({
        url: '/user/update/' + id,
        method: 'put',
        data: updateDTO
    });
}