import request from '@/utils/request';

// 分页查询员工
export function getEmployeePage(pageNum, pageSize, name, phone) {
    return request({
        url: '/employee/page',
        method: 'get',
        params: {
            pageNum,
            pageSize,
            name,
            phone
        }
    })
}

// 根据ID获取员工详情
export function getEmployeeById(id) {
    return request({
        url: `/employee/info/${id}`,
        method: 'get'
    })
}

// 获取所有员工列表
export function getEmployeeList() {
    return request({
        url: '/employee/list',
        method: 'get'
    })
}

// 根据用户ID获取员工信息
export function getEmployeeByUserId(userId) {
    return request({
        url: `/employee/info/user/${userId}`,
        method: 'get'
    })
}

// 新增或修改员工
export function addOrUpdateEmployee(data) {
    return request({
        url: '/employee/addOrUpdate',
        method: 'post',
        data
    })
}

// 删除员工
export function deleteEmployee(id) {
    return request({
        url: `/employee/delete/${id}`,
        method: 'delete'
    })
}

// 上传员工头像
export function uploadAvatar(employeeId, file) {
    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('employeeId', employeeId)

    return request({
        url: '/employee/update-avatar',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    })
}

// 上传员工简历
export function uploadResume(employeeId, file) {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('employeeId', employeeId)

    return request({
        url: '/employee/upload-resume',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 更新员工角色
export function updateEmployeeRole() {
    return request({
        url: '/employee/updateRole',
        method: 'post'
    })
}