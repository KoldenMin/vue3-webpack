// src/api/department.js
import request from '@/utils/request'

/**
 * 获取部门列表
 */
export function getDepartmentList() {
    return request({
        url: '/department/list',
        method: 'get'
    })
}

/**
 * 获取部门分页数据
 * @param {number} pageNum - 当前页码
 * @param {number} pageSize - 每页数量
 * @param {string} name - 部门名称(可选)
 * @param {string} depaFunction - 部门职能(可选)
 */
export function getDepartmentPage(pageNum, pageSize, name, depaFunction) {
    return request({
        url: '/department/page',
        method: 'get',
        params: {
            pageNum,
            pageSize,
            name,
            depaFunction
        }
    })
}

/**
 * 获取部门详情
 * @param {number} id - 部门ID
 */
export function getDepartmentInfo(id) {
    return request({
        url: `/department/info/${id}`,
        method: 'get'
    })
}

/**
 * 添加部门
 * @param {Object} data - 部门数据
 */
export function addDepartment(data) {
    return request({
        url: '/department/add',
        method: 'post',
        data
    })
}

/**
 * 更新部门
 * @param {number} id - 部门ID
 * @param {Object} data - 更新的部门数据
 */
export function updateDepartment(id, data) {
    return request({
        url: `/department/update/${id}`,
        method: 'put',
        data
    })
}

/**
 * 删除部门
 * @param {number} id - 部门ID
 */
export function deleteDepartment(id) {
    return request({
        url: `/department/delete/${id}`,
        method: 'delete'
    })
}

/**
 * 获取部门成员列表
 * @param {number} departmentId - 部门ID
 */
export function getDepartmentEmployees(departmentId) {
    return request({
        url: `/department/employeeList/${departmentId}`,
        method: 'get'
    })
}