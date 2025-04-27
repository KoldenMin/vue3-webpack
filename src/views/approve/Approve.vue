<template>
  <div class="approval-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>注册审核列表</span>
          <div class="header-actions">
            <el-button type="danger" @click="handleDeleteApproved" :disabled="!hasApproved">
              <el-icon>
                <Delete/>
              </el-icon>
              删除已通过审核
            </el-button>
          </div>
        </div>
      </template>

      <el-alert
          title="注册审核管理"
          type="info"
          description="这里显示了系统中所有用户的注册审核申请，您可以进行审核操作"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
      />

      <div class="approval-search">
        <div class="search-container">
          <el-input
              placeholder="姓名查询"
              v-model="realName"
              clearable
          ></el-input>
          <el-select v-model="status" placeholder="审核状态" clearable>
            <el-option label="全部" :value="''"></el-option>
            <el-option label="待审核" :value="0"></el-option>
            <el-option label="已通过" :value="1"></el-option>
            <el-option label="已拒绝" :value="2"></el-option>
          </el-select>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button type="info" @click="handleClear">
            重置
          </el-button>
        </div>
      </div>

      <div class="batch-operations" v-if="multipleSelection.length > 0">
        <el-alert
            title="批量操作"
            type="warning"
            :description="`已选择 ${multipleSelection.length} 条记录，可进行批量操作`"
            show-icon
            style="margin-bottom: 10px;"
        />
        <el-button type="success" @click="handleBatchApprove" :disabled="!hasUnapproved">
          批量通过
        </el-button>
        <el-button type="danger" @click="handleBatchReject" :disabled="!hasUnapproved">
          批量拒绝
        </el-button>
      </div>

      <el-table
          v-loading="loading"
          :data="approvalList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          highlight-current-row
      >
        <el-table-column
            type="selection"
            width="55"
        />

        <el-table-column
            type="index"
            label="#"
            width="60"
            align="center"
        />

        <el-table-column
            prop="userId"
            label="用户ID"
            width="100"
            align="center"
        />

        <el-table-column
            prop="realName"
            label="姓名"
            width="120"
        />

        <el-table-column
            prop="status"
            label="审核状态"
            width="100"
            align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="info">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="employeeName"
            label="审核员姓名"
            width="100"
            align="center"
        >
          <template #default="scope">
            {{ scope.row.employeeName || '未分配' }}
          </template>
        </el-table-column>

        <el-table-column
            prop="approvalOpinion"
            label="审核意见"
            min-width="180"
            show-overflow-tooltip
        >
          <template #default="scope">
            {{ scope.row.approvalOpinion || '暂无意见' }}
          </template>
        </el-table-column>

        <el-table-column
            prop="approvalTime"
            label="审核时间"
            width="180"
            align="center"
            :formatter="dateFormatter"
        />

        <el-table-column
            prop="departmentName"
            label="拟转入部门"
            width="120"
            align="center"
        >
          <template #default="scope">
            {{ scope.row.departmentName || '暂无部门' }}
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="250"
            align="center"
            fixed="right"
        >
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewApprovalDetail(scope.row)"
            >
              查看
            </el-button>
            <el-button
                v-if="scope.row.status === 0"
                type="success"
                size="small"
                @click="handleApprove(scope.row)"
            >
              通过
            </el-button>
            <el-button
                v-if="scope.row.status === 0"
                type="danger"
                size="small"
                @click="handleReject(scope.row)"
            >
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="demo-pagination-block">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[1,2,3,10]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 审核详情对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="注册审核详情"
        width="600px"
        top="5vh"
    >
      <div v-if="selectedApproval" class="approval-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ selectedApproval.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedApproval.userId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedApproval.realName }}</el-descriptions-item>
          <el-descriptions-item label="拟转入部门">{{
              selectedApproval.departmentName || '未指定'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag v-if="selectedApproval.status === 0" type="info">待审核</el-tag>
            <el-tag v-else-if="selectedApproval.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核员">{{ selectedApproval.employeeName || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间" :span="2">
            {{ selectedApproval.approvalTime ? dateFormatter(null, null, selectedApproval.approvalTime) : '暂无时间' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="2">
            {{ selectedApproval.approvalOpinion || '暂无审核意见' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="approval-actions" v-if="selectedApproval.status === 0">
          <el-button type="success" @click="handleApprove(selectedApproval)">通过申请</el-button>
          <el-button type="danger" @click="handleReject(selectedApproval)">拒绝申请</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 审核操作对话框 -->
    <el-dialog
        v-model="approvalDialogVisible"
        destroy-on-close
        :title="approvalAction === 'approve' ? '通过审核' : '拒绝审核'"
        width="500px"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="拟转入部门" prop="targetDepartmentId" v-if="approvalAction === 'approve'">
          <el-select v-model="approvalForm.targetDepartmentId" placeholder="请选择拟转入部门" filterable>
            <el-option
                v-for="dept in departmentList"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见" prop="approvalOpinion">
          <el-input
              v-model="approvalForm.approvalOpinion"
              type="textarea"
              :rows="4"
              placeholder="请输入您的审核意见"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量审核对话框 -->
    <el-dialog
        v-model="batchDialogVisible"
        :title="batchAction === 'approve' ? '批量通过审核' : '批量拒绝审核'"
        width="500px"
        destroy-on-close
    >
      <p>您选择了 {{ multipleSelection.length }} 条记录进行{{ batchAction === 'approve' ? '通过' : '拒绝' }}操作</p>

      <el-form :model="batchForm" :rules="batchRules" ref="batchFormRef" label-width="100px">
        <el-form-item label="拟转入部门ID" prop="targetDepartmentId" v-if="batchAction === 'approve'">
          <el-select v-model="approvalForm.targetDepartmentId" placeholder="请选择拟转入部门" filterable>
            <el-option
                v-for="dept in departmentList"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="统一审核意见" prop="approvalOpinion">
          <el-input
              v-model="batchForm.approvalOpinion"
              type="textarea"
              :rows="4"
              placeholder="请输入统一的审核意见"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchApproval" :loading="batchSubmitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Delete, Search, RefreshRight, Check, Close, View} from '@element-plus/icons-vue';
import {
  getApprovalPage,
  addOrUpdateApproval,
  deleteApprovalRecords, getAllDepartments
} from '@/api/registerApprove';
import {useEmployeeStore} from "@/store/employeeStore";

// 审核列表数据
const loading = ref(false);
const submitLoading = ref(false);
const batchSubmitLoading = ref(false);
const approvalList = ref([]);
const dialogVisible = ref(false);
const selectedApproval = ref(null);
const approvalDialogVisible = ref(false);
const approvalAction = ref('');
const currentApproval = ref(null);
const multipleSelection = ref([]);
const batchDialogVisible = ref(false);
const batchAction = ref('');
const departmentList = ref([])

// 分页参数
const currentPage = ref(1);
const pageSize = ref(5); // 默认与后端一致
const total = ref(0);

// store
const employeeStore = useEmployeeStore();

// 搜索参数
const realName = ref('');
const status = ref(null);

// 审核表单
const approvalForm = ref({
  id: null,
  userId: null,
  realName: '',
  approverId: null, // 这里应该从登录用户中获取
  status: 0,
  approvalOpinion: '',
  approvalTime: null,
  employeeName: null,
  departmentName: null,
  targetDepartmentId: null,
});

// 批量审核表单
const batchForm = ref({
  approvalOpinion: '',
  targetDepartmentId: null,
  status: 0
});

// 表单校验规则
const approvalRules = {
  approvalOpinion: [
    {required: true, message: '请输入审核意见', trigger: 'blur'},
    {min: 2, max: 200, message: '长度在 2 到 200 个字符之间', trigger: 'blur'}
  ],
  targetDepartmentId: [
    {required: true, message: '请输入拟转入部门ID', trigger: 'blur'},
    {type: 'number', message: '部门ID必须为数字', trigger: ['blur', 'change']}
  ]
};

// 批量表单校验规则
const batchRules = {
  approvalOpinion: [
    {required: true, message: '请输入统一审核意见', trigger: 'blur'},
    {min: 2, max: 200, message: '长度在 2 到 200 个字符之间', trigger: 'blur'}
  ],
  targetDepartmentId: [
    {required: true, message: '请输入拟转入部门ID', trigger: 'blur'},
    {type: 'number', message: '部门ID必须为数字', trigger: ['blur', 'change']}
  ]
};

// 表单引用
const approvalFormRef = ref(null);
const batchFormRef = ref(null);

// 计算是否有已通过的审核
const hasApproved = computed(() => {
  return approvalList.value.some(item => item.status === 1);
});

// 计算选中项中是否有未审核的记录
const hasUnapproved = computed(() => {
  return multipleSelection.value.some(item => item.status === 0);
});

// 处理选择变化
const handleSelectionChange = (selection) => {
  multipleSelection.value = selection;
};

// 处理分页变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchApprovalList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchApprovalList();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchApprovalList();
};

// 清空搜索条件
const handleClear = () => {
  realName.value = '';
  status.value = null;
  currentPage.value = 1;
  fetchApprovalList();
};

//获取部门列表
const fetchDepartmentList = async () => {
  const result = await getAllDepartments();
  if (result.code === 200) {
    departmentList.value = result.data
  }
};

// 获取审核列表
const fetchApprovalList = async () => {
  loading.value = true;
  try {
    const result = await getApprovalPage(
        currentPage.value,
        pageSize.value,
        realName.value || undefined,
        status.value !== null ? status.value : undefined
    );

    if (result.code === 200) {
      approvalList.value = result.data.records;
      total.value = result.data.total;
      await employeeStore.getEmployeeInfoAction()
    } else {
      ElMessage.error(result.message || '获取列表失败');
    }
  } catch (error) {
    console.error('获取审核列表失败:', error);
    ElMessage.error('获取审核列表失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 查看审核详情
const viewApprovalDetail = (approval) => {
  selectedApproval.value = {...approval};
  dialogVisible.value = true;
};

// 处理通过审核
const handleApprove = (approval) => {
  approvalAction.value = 'approve';
  currentApproval.value = {...approval};

  approvalForm.value = {
    id: approval.id,
    userId: approval.userId,
    realName: approval.realName,
    approverId: employeeStore.employeeId, // 应该从当前登录用户获取
    status: 1, // 1表示通过
    approvalOpinion: '',
    approvalTime: getIsoDateTime(),
    targetDepartmentId: approval.targetDepartmentId || null
  };
  fetchDepartmentList()
  approvalDialogVisible.value = true;
};

// 处理拒绝审核
const handleReject = (approval) => {
  approvalAction.value = 'reject';
  currentApproval.value = {...approval};

  approvalForm.value = {
    id: approval.id,
    userId: approval.userId,
    realName: approval.realName,
    approverId: employeeStore.employeeId, // 应该从当前登录用户获取
    status: 2, // 2表示拒绝
    approvalOpinion: '',
    approvalTime: getIsoDateTime(),
    targetDepartmentId: approval.targetDepartmentId
  };

  approvalDialogVisible.value = true;
};

// 提交审核结果
const submitApproval = async () => {
  if (!approvalFormRef.value) return;

  try {
    await approvalFormRef.value.validate();

    submitLoading.value = true;
    const response = await addOrUpdateApproval(approvalForm.value);

    if (response.code === 200) {
      ElMessage.success(approvalAction.value === 'approve' ? '审核通过成功' : '审核拒绝成功');
      approvalDialogVisible.value = false;
      await fetchApprovalList();

      // 如果详情对话框打开着，也更新它
      if (dialogVisible.value && selectedApproval.value && selectedApproval.value.id === approvalForm.value.id) {
        selectedApproval.value = {...approvalForm.value};
      }
    } else {
      ElMessage.error(response.message || '提交审核结果失败');
    }
  } catch (error) {
    console.error('提交审核结果失败:', error);
    ElMessage.error('提交审核结果失败: ' + (error.message || '未知错误'));
  } finally {
    submitLoading.value = false;
  }
};

// 处理批量通过
const handleBatchApprove = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }

  // 检查是否包含已审核的记录
  const hasApproved = multipleSelection.value.some(item => item.status !== 0);
  if (hasApproved) {
    ElMessage.warning('只能对待审核的记录进行批量操作');
    return;
  }

  batchAction.value = 'approve';
  batchForm.value = {
    approvalOpinion: '',
    targetDepartmentId: null,
    status: 1
  };
  batchDialogVisible.value = true;
};

// 处理批量拒绝
const handleBatchReject = () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }

  // 检查是否包含已审核的记录
  const hasApproved = multipleSelection.value.some(item => item.status !== 0);
  if (hasApproved) {
    ElMessage.warning('只能对待审核的记录进行批量操作');
    return;
  }

  batchAction.value = 'reject';
  batchForm.value = {
    approvalOpinion: '',
    targetDepartmentId: null,
    status: 2
  };
  batchDialogVisible.value = true;
};

// 提交批量审核
const submitBatchApproval = async () => {
  if (!batchFormRef.value) return;

  try {
    // 对于拒绝操作，不需要验证部门ID
    if (batchAction.value === 'reject') {
      await batchFormRef.value.validateField('approvalOpinion');
    } else {
      await batchFormRef.value.validate();
    }

    batchSubmitLoading.value = true;

    // 构建批量处理的对象数组
    const batchData = multipleSelection.value.map(item => ({
      id: item.id,
      userId: item.userId,
      realName: item.realName,
      approverId: employeeStore.employeeId, // 应该从当前登录用户获取
      status: batchAction.value === 'approve' ? 1 : 2,
      approvalOpinion: batchForm.value.approvalOpinion,
      approvalTime: getIsoDateTime(),
      targetDepartmentId: batchAction.value === 'approve' ? batchForm.value.targetDepartmentId : item.targetDepartmentId
    }));

    // 由于后端没有批量API，这里使用Promise.all进行并行处理
    const promises = batchData.map(data => addOrUpdateApproval(data));
    const results = await Promise.all(promises);

    // 检查是否所有请求都成功
    const allSuccess = results.every(result => result.code === 200);

    if (allSuccess) {
      ElMessage.success(`批量${batchAction.value === 'approve' ? '通过' : '拒绝'}成功`);
      batchDialogVisible.value = false;
      fetchApprovalList();
    } else {
      ElMessage.error(`批量${batchAction.value === 'approve' ? '通过' : '拒绝'}部分失败`);
    }
  } catch (error) {
    console.error('批量审核失败:', error);
    ElMessage.error('批量审核失败: ' + (error.message || '未知错误'));
  } finally {
    batchSubmitLoading.value = false;
  }
};

// 删除已通过审核的记录
const handleDeleteApproved = async () => {
  ElMessageBox.confirm(
      '确定要删除所有已通过审核的记录吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    loading.value = true;
    try {
      const response = await deleteApprovalRecords();

      if (response.code === 200 && response.data) {
        ElMessage.success('删除成功');
        fetchApprovalList();
      } else {
        ElMessage.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    // 取消操作
  });
};
// 格式化日期
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleString();
};

function getIsoDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  // 返回格式：2025-04-27T08:32:46
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  fetchApprovalList();
});
</script>

<style scoped>
.approval-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.approval-detail {
  max-height: 600px;
  overflow-y: auto;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 搜索区域整体样式 */
.approval-search {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 搜索容器布局 */
.search-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

/* 输入框样式 */
.el-input, .el-select {
  width: 220px;
}

.batch-operations {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  align-items: center;
}

.approval-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .el-input, .el-select {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>