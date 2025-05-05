<template>
  <div class="project-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
          <el-button type="primary" @click="openAddProject">创建项目</el-button>
        </div>
      </template>

      <el-alert
          title="项目管理"
          type="info"
          description="这里显示了系统中所有项目的信息列表"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
      />
      <div class="project-search">
        <div class="search-container">
          <el-input placeholder="项目名称" v-model="name"></el-input>
          <el-input placeholder="项目概述" v-model="description"></el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="danger" @click="handleClear">清空</el-button>
        </div>
      </div>

      <el-table
          v-loading="loading"
          :data="projectList"
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
            label="项目名称"
            width="200"
        />

        <el-table-column
            label="项目时间"
            width="240"
        >
          <template #default="scope">
            {{ formatDateRange(scope.row.startDate, scope.row.endDate) }}
          </template>
        </el-table-column>

        <el-table-column
            prop="description"
            label="项目概述"
            min-width="300"
            show-overflow-tooltip
        />

        <el-table-column
            prop="participantCount"
            label="参与人数"
            width="100"
            align="center"
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
            width="320"
            align="center"
        >
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewProjectDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
                type="warning"
                size="small"
                @click="editProject(scope.row)"
            >
              编辑项目
            </el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelProject(scope.row.id)">
              <template #reference>
                <el-button type="danger" size="small">删除项目</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="demo-pagination-block">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[2,3,5,10]"
            layout="sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 项目详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="项目详情"
        width="700px"
    >
      <div v-if="selectedProject" class="project-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">{{ selectedProject.name }}</el-descriptions-item>
          <el-descriptions-item label="项目时间">{{
              formatDateRange(selectedProject.startDate, selectedProject.endDate)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="参与人数">{{ selectedProject.participantCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
              dateFormatter(null, null, selectedProject.createTime)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="项目概述" :span="2">{{
              selectedProject.description || '无'
            }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="participants-section">
          <div class="section-header">
            <h3>参与人员</h3>
          </div>

          <div v-if="selectedProject.participantEmployees && selectedProject.participantEmployees.length > 0">
            <el-table :data="selectedProject.participantEmployees" border style="width: 100%">
              <el-table-column prop="name" label="姓名" width="120"></el-table-column>
              <el-table-column label="性别" width="80" align="center">
                <template #default="scope">
                  {{ scope.row.gender === 1 ? '男' : '女' }}
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="电话" width="150"></el-table-column>
              <el-table-column prop="jobDescription" label="职能描述" min-width="180"
                               show-overflow-tooltip></el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无参与人员"/>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑项目对话框 -->
    <el-dialog
        v-model="formDialogVisible"
        :title="isEdit ? '编辑项目' : '创建项目'"
        width="600px"
    >
      <el-form
          ref="projectFormRef"
          :model="projectForm"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="项目时间" prop="dateRange">
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="项目概述" prop="description">
          <el-input
              v-model="projectForm.description"
              type="textarea"
              :rows="4"
              placeholder="请输入项目概述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProjectForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, reactive} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {
  getProjectPage,
  addOrUpdateProject,
  deleteProject,
  getProjectInfo,
  getProjectWithUsers,
  updateProjectParticipantCount
} from '@/api/project';

// 数据状态
const loading = ref(false);
const projectList = ref([]);
const detailDialogVisible = ref(false);
const formDialogVisible = ref(false);
const selectedProject = ref(null);
const isEdit = ref(false);
const projectFormRef = ref(null);

// 分页参数
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const name = ref('');
const description = ref('');

// 表单数据
const projectForm = reactive({
  id: null,
  name: '',
  startDate: '',
  endDate: '',
  description: '',
  participantCount: 0
});

const dateRange = ref([]);

// 表单校验规则
const formRules = {
  name: [
    {required: true, message: '请输入项目名称', trigger: 'blur'},
    {min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur'}
  ],
  description: [
    {max: 500, message: '长度不能超过 500 个字符', trigger: 'blur'}
  ]
};

// 处理日期范围变化
const handleDateRangeChange = (val) => {
  if (val) {
    projectForm.startDate = val[0];
    projectForm.endDate = val[1];
  } else {
    projectForm.startDate = '';
    projectForm.endDate = '';
  }
};

// 清空表单
const resetForm = () => {
  if (projectFormRef.value) {
    projectFormRef.value.resetFields();
  }
  projectForm.id = null;
  projectForm.name = '';
  projectForm.startDate = '';
  projectForm.endDate = '';
  projectForm.description = '';
  projectForm.participantCount = 0;
  dateRange.value = [];
};

// 打开创建项目对话框
const openAddProject = () => {
  isEdit.value = false;
  resetForm();
  formDialogVisible.value = true;
};

// 打开编辑项目对话框
const editProject = (row) => {
  isEdit.value = true;
  resetForm();
  projectForm.id = row.id;
  projectForm.name = row.name;
  projectForm.startDate = row.startDate;
  projectForm.endDate = row.endDate;
  projectForm.description = row.description;
  projectForm.participantCount = row.participantCount || 0;

  if (row.startDate && row.endDate) {
    dateRange.value = [row.startDate, row.endDate];
  }

  formDialogVisible.value = true;
};

// 提交项目表单
const submitProjectForm = async () => {
  if (!projectFormRef.value) return;

  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true;
        await addOrUpdateProject(projectForm);
        ElMessage.success(isEdit.value ? '更新项目成功' : '创建项目成功');
        formDialogVisible.value = false;
        fetchProjectList();
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新项目失败' : '创建项目失败');
        console.error(error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchProjectList();
};

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchProjectList();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchProjectList();
};

// 清空搜索
const handleClear = () => {
  name.value = '';
  description.value = '';
  fetchProjectList();
};

// 删除项目
const handleDelProject = async (id) => {
  try {
    loading.value = true;
    await deleteProject(id);
    ElMessage.success('删除项目成功');
    fetchProjectList();
  } catch (error) {
    ElMessage.error('删除项目失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 查看项目详情
const viewProjectDetail = async (project) => {
  loading.value = true;
  try {
    const response = await getProjectWithUsers(project.id);
    selectedProject.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error('获取项目详情失败:', error);
    ElMessage.error('获取项目详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true;
  try {
    const response = await getProjectPage(
        currentPage.value,
        pageSize.value,
        name.value,
        description.value
    );
    projectList.value = response.data.records;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    ElMessage.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const dateFormatter = (row, column, cellValue) => {
  if (!cellValue) return '-';
  const date = new Date(cellValue);
  return date.toLocaleString();
};

// 格式化日期范围
const formatDateRange = (startDate, endDate) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const start = startDate ? formatDate(startDate) : '未设置';
  const end = endDate ? formatDate(endDate) : '未设置';
  return `${start} 至 ${end}`;
};

// 页面加载时获取项目列表
onMounted(() => {
  fetchProjectList();
});
</script>

<style scoped>
.project-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header {
  margin: 20px 0;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

h3 {
  margin: 0;
  color: #303133;
}

.project-detail {
  max-height: 600px;
  overflow-y: auto;
}

.participants-section {
  margin-top: 20px;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 搜索区域整体样式 */
.project-search {
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

.el-input__inner {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: border-color 0.2s;
}

.el-input__inner:focus {
  border-color: #409EFF;
}

/* 搜索按钮样式 */
.el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
  padding: 9px 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
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