import request from '@/utils/request'

// 新增或更新项目
export function addOrUpdateProject(data) {
    return request({
        url: '/project/addOrUpdate',
        method: 'post',
        data
    })
}

// 根据ID获取项目信息
export function getProjectInfo(id) {
    return request({
        url: `/project/info/${id}`,
        method: 'get'
    })
}

// 删除项目
export function deleteProject(id) {
    return request({
        url: `/project/delete/${id}`,
        method: 'delete'
    })
}

// 分页查询项目列表
export function getProjectPage(pageNum, pageSize, name, description) {
    return request({
        url: '/project/page',
        method: 'get',
        params: {
            pageNum,
            pageSize,
            name,
            description
        }
    })
}

// 获取项目及其参与人员
export function getProjectWithUsers(projectId) {
    return request({
        url: `/project/userList/${projectId}`,
        method: 'get'
    })
}

// 更新项目参与人数
export function updateProjectParticipantCount() {
    return request({
        url: '/project/updateCount',
        method: 'post'
    })
}