import request from '@/utils/request';

// 获取注册审核列表
export function getApprovalPage(pageNum, pageSize, realName, status) {
    return request({
        url: '/registration-approval/page',
        method: 'get',
        params: {
            pageNum,
            pageSize,
            realName: realName || undefined,
            status: status !== undefined && status !== null ? status : undefined
        }
    });
}

// 添加或更新注册审核记录
export function addOrUpdateApproval(data) {
    return request({
        url: '/registration-approval/addOrUpdate',
        method: 'post',
        data
    });
}

// 删除已通过审核的记录
export function deleteApprovalRecords() {
    return request({
        url: '/registration-approval/delete',
        method: 'delete',
    });
}

// 根据id获取审核详情
export function getApprovalById(id) {
    return request({
        url: `/registration-approval/${id}`,
        method: 'get',
    });
}

// 批量审核
export function batchApproval(ids, data) {
    return request({
        url: '/registration-approval/batchApprove',
        method: 'post',
        data: {
            ids,
            ...data
        }
    });
}

// 统计功能
export function statisticsApproval() {
    return request({
        url: '/registration-approval/statistics',
        method: 'get',
    });
}

// 获取所有部门列表
export function getAllDepartments() {
    return request({
        url: '/registration-approval/getAllDepartment',
        method: 'get',
    });
}

