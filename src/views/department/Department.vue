<script setup>
import {ref, onMounted, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {
  getDepartmentPage,
  getDepartmentInfo,
  getDepartmentEmployees,
  addDepartment,
  updateDepartment,
  deleteDepartment
} from '@/api/department';

// 组件状态
const loading = ref(false);
const departmentList = ref([]);
const detailDialogVisible = ref(false);
const employeesDialogVisible = ref(false);
const formDialogVisible = ref(false);
const isEdit = ref(false);
const selectedDepartment = ref(null);
const departmentEmployees = ref([]);
const departmentFormRef = ref(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const searchName = ref('');
const searchFunction = ref('');

// 表单数据
const departmentForm = reactive({
  id: null,
  name: '',
  depaFunction: '',
  workingDate: '',
  workingHours: '',
  employeeCount: 0
});

// 表单验证规则
const rules = {
  name: [
    {required: true, message: '请输入部门名称', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  depaFunction: [
    {required: true, message: '请输入部门职能', trigger: 'blur'}
  ]
};

// 页面加载时获取部门列表
onMounted(() => {
  fetchDepartmentList();
});

// 获取部门列表数据（分页）
const fetchDepartmentList = async () => {
  loading.value = true;
  try {
    const response = await getDepartmentPage(
        currentPage.value,
        pageSize.value,
        searchName.value,
        searchFunction.value
    );

    if (response.code === 200) {
      departmentList.value = response.data.records;
      total.value = response.data.total;
    } else {
      ElMessage.error(response.msg || '获取部门列表失败');
    }
  } catch (error) {
    console.error('获取部门列表失败:', error);
    ElMessage.error('获取部门列表失败');
  } finally {
    loading.value = false;
  }
};

// 查询
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchDepartmentList();
};

// 清空搜索条件
const handleClear = () => {
  searchName.value = '';
  searchFunction.value = '';
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchDepartmentList();
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchDepartmentList();
};

// 查看部门详情
const viewDepartmentDetail = async (department) => {
  loading.value = true;
  try {
    const response = await getDepartmentInfo(department.id);
    if (response.code === 200) {
      selectedDepartment.value = response.data;
      detailDialogVisible.value = true;
    } else {
      ElMessage.error(response.msg || '获取部门详情失败');
    }
  } catch (error) {
    console.error('获取部门详情失败:', error);
    ElMessage.error('获取部门详情失败');
  } finally {
    loading.value = false;
  }
};

// 查看部门成员
const viewDepartmentEmployees = async (department) => {
  loading.value = true;
  try {
    const response = await getDepartmentEmployees(department.id);
    if (response.code === 200) {
      departmentEmployees.value = response.data || [];
      employeesDialogVisible.value = true;
    } else {
      ElMessage.error(response.msg || '获取部门成员失败');
    }
  } catch (error) {
    console.error('获取部门成员失败:', error);
    ElMessage.error('获取部门成员失败');
  } finally {
    loading.value = false;
  }
};

// 编辑部门
const editDepartment = async (department) => {
  isEdit.value = true;
  const response = await getDepartmentInfo(department.id);
  if (response.code === 200) {
    const deptData = response.data;
    Object.assign(departmentForm, {
      id: deptData.id,
      name: deptData.name,
      depaFunction: deptData.depaFunction,
      workingDate: deptData.workingDate,
      workingHours: deptData.workingHours
    });
    formDialogVisible.value = true;
  } else {
    ElMessage.error('获取部门信息失败');
  }
};

// 显示添加部门对话框
const showAddDepartmentDialog = () => {
  isEdit.value = false;
  Object.assign(departmentForm, {
    id: null,
    name: '',
    depaFunction: '',
    workingDate: '',
    workingHours: '',
    employeeCount: 0
  });
  formDialogVisible.value = true;
};

// 提交部门表单
const submitDepartmentForm = async () => {
  if (!departmentFormRef.value) return;

  await departmentFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        let response;
        if (isEdit.value) {
          // 修改部门
          const updateDTO = {
            name: departmentForm.name,
            depaFunction: departmentForm.depaFunction,
            workingDate: departmentForm.workingDate,
            workingHours: departmentForm.workingHours
          };
          response = await updateDepartment(departmentForm.id, updateDTO);
        } else {
          // 添加部门
          response = await addDepartment(departmentForm);
        }

        if (response.code === 200) {
          ElMessage.success(isEdit.value ? '修改部门成功' : '添加部门成功');
          formDialogVisible.value = false;
          fetchDepartmentList(); // 刷新列表
        } else {
          ElMessage.error(response.msg || (isEdit.value ? '修改部门失败' : '添加部门失败'));
        }
      } catch (error) {
        console.error(isEdit.value ? '修改部门失败:' : '添加部门失败:', error);
        ElMessage.error(isEdit.value ? '修改部门失败' : '添加部门失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 删除部门
const handleDelDepartment = async (id) => {
  loading.value = true;
  try {
    const response = await deleteDepartment(id);
    if (response.code === 200) {
      ElMessage.success('删除部门成功');
      fetchDepartmentList(); // 刷新列表
    } else {
      ElMessage.error(response.msg || '删除部门失败');
    }
  } catch (error) {
    console.error('删除部门失败:', error);
    ElMessage.error('删除部门失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '';
  const date = new Date(cellValue);
  return date.toLocaleString();
};
</script>

<template>
  <div class="department-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门列表</span>
          <el-button type="primary" @click="showAddDepartmentDialog">添加部门</el-button>
        </div>
      </template>

      <el-alert
          title="部门管理"
          type="info"
          description="这里显示了系统中所有部门的信息列表"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
      />

      <div class="department-search">
        <div class="search-container">
          <el-input placeholder="部门名称查询" v-model="searchName"></el-input>
          <el-input placeholder="部门职能查询" v-model="searchFunction"></el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="danger" @click="handleClear">清空</el-button>
        </div>
      </div>

      <el-table
          v-loading="loading"
          :data="departmentList"
          border
          style="width: 100%"
      >
        <el-table-column
            type="index"
            label="#"
            width="60"
            align="center"
        />

        <el-table-column
            prop="name"
            label="部门名称"
            width="150"
        />

        <el-table-column
            prop="depaFunction"
            label="部门职能"
            width="200"
            show-overflow-tooltip
        />

        <el-table-column
            prop="employeeCount"
            label="部门人数"
            width="100"
            align="center"
        />

        <el-table-column
            prop="workingDate"
            label="工作日期"
            width="120"
        />

        <el-table-column
            prop="workingHours"
            label="工作时长"
            width="120"
        />

        <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            align="center"
            :formatter="dateFormatter"
        />

        <el-table-column
            label="操作"
            min-width="280"
            align="center"
        >
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewDepartmentDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="viewDepartmentEmployees(scope.row)"
            >
              查看成员
            </el-button>
            <el-button
                type="warning"
                size="small"
                @click="editDepartment(scope.row)"
            >
              编辑
            </el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelDepartment(scope.row.id)">
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[1,2,5,10]"
            layout="sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 部门详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="部门详情"
        width="600px"
    >
      <div v-if="selectedDepartment" class="department-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="部门名称">{{ selectedDepartment.name }}</el-descriptions-item>
          <el-descriptions-item label="部门人数">{{ selectedDepartment.employeeCount }}</el-descriptions-item>
          <el-descriptions-item label="工作日期">{{ selectedDepartment.workingDate }}</el-descriptions-item>
          <el-descriptions-item label="工作时长">{{ selectedDepartment.workingHours }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ dateFormatter(null, null, selectedDepartment.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ dateFormatter(null, null, selectedDepartment.updateTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="部门职能" :span="2">{{ selectedDepartment.depaFunction }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 部门成员对话框 -->
    <el-dialog
        v-model="employeesDialogVisible"
        title="部门成员"
        width="800px"
    >
      <div v-if="departmentEmployees.length > 0">
        <el-table :data="departmentEmployees" border>
          <el-table-column type="index" label="#" width="60" align="center"/>
          <el-table-column prop="name" label="姓名" width="120"/>
          <el-table-column prop="gender" label="性别" width="80" align="center">
            <template #default="scope">
              {{ scope.row.gender === 1 ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="age" label="年龄" width="80" align="center"/>
          <el-table-column prop="phone" label="电话" width="150"/>
          <el-table-column prop="jobDescription" label="职能描述" min-width="200" show-overflow-tooltip/>
        </el-table>
      </div>
      <el-empty v-else description="该部门暂无成员"/>
    </el-dialog>

    <!-- 添加/编辑部门对话框 -->
    <el-dialog
        v-model="formDialogVisible"
        :title="isEdit ? '编辑部门' : '添加部门'"
        width="600px"
    >
      <el-form
          ref="departmentFormRef"
          :model="departmentForm"
          :rules="rules"
          label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="departmentForm.name" placeholder="请输入部门名称"/>
        </el-form-item>
        <el-form-item label="部门职能" prop="depaFunction">
          <el-input
              v-model="departmentForm.depaFunction"
              type="textarea"
              placeholder="请输入部门职能描述"
              :rows="3"
          />
        </el-form-item>
        <el-form-item label="工作日期" prop="workingDate">
          <el-input v-model="departmentForm.workingDate" placeholder="例如：周一至周五"/>
        </el-form-item>
        <el-form-item label="工作时长" prop="workingHours">
          <el-input v-model="departmentForm.workingHours" placeholder="例如：9:00-18:00"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitDepartmentForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.department-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 搜索区域整体样式 */
.department-search {
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
.el-input {
  width: 220px;
}

.department-detail {
  max-height: 500px;
  overflow-y: auto;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .el-input {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>