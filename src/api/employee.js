import request from '@/utils/request';

// 用户登录
export function getEmpByUserId(id) {
    return request({
        url: `/employee/info/user/${id}`,
        method: 'get',
    });
}