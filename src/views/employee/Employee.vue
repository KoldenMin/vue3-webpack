<template>
  <div class="employee-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工列表</span>
          <el-button type="primary" @click="openAddDialog">新增员工</el-button>
        </div>
      </template>

      <el-alert
          title="员工管理"
          type="info"
          description="这里显示了系统中所有员工的信息列表"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
      />

      <div class="employee-search">
        <div class="search-container">
          <el-input placeholder="姓名查询" v-model="name" clearable></el-input>
          <el-input placeholder="电话查询" v-model="phone" clearable></el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="danger" @click="handleClear">清空</el-button>
        </div>
      </div>

      <el-table
          v-loading="loading"
          :data="employeeList"
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
            label="姓名"
            width="120"
        />

        <el-table-column
            prop="phone"
            label="电话"
            width="130"
        />

        <el-table-column
            prop="gender"
            label="性别"
            width="80"
            align="center"
        >
          <template #default="scope">
            {{ scope.row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>

        <el-table-column
            prop="age"
            label="年龄"
            width="80"
            align="center"
        />

        <el-table-column
            prop="departmentName"
            label="部门名称"
            width="120"
            align="center"
        />

        <el-table-column
            prop="role"
            label="角色"
            width="100"
            align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.role === 2" type="success">经理</el-tag>
            <el-tag v-else-if="scope.row.role === 1" type="warning">管理员</el-tag>
            <el-tag v-else type="info">员工</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="currentAddress"
            label="当前住址"
            min-width="200"
            show-overflow-tooltip
        />

        <el-table-column
            prop="entryTime"
            label="入职时间"
            width="180"
            align="center"
        />

        <el-table-column
            label="头像"
            width="100"
            align="center"
        >
          <template #default="scope">
            <el-avatar v-if="scope.row.avatar" :src="formatResourceUrl(scope.row.avatar)" :size="40"></el-avatar>
            <el-avatar v-else :size="40" icon="el-icon-user"></el-avatar>
          </template>
        </el-table-column>

        <el-table-column
            label="操作"
            width="420"
            align="center"
        >
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewEmployeeDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
                type="warning"
                size="small"
                @click="handleUpload(scope.row.id)"
            >
              上传文件
            </el-button>
            <el-popconfirm title="确认删除？" @confirm="handleDelEmployee(scope.row.id)">
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
            :page-sizes="[2,3,5,10]"
            layout="sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 员工详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="员工详情"
        width="700px"
    >
      <div v-if="selectedEmployee" class="employee-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ selectedEmployee.name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selectedEmployee.phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedEmployee.gender === 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ selectedEmployee.age || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag v-if="selectedEmployee.role === 2" type="success">经理</el-tag>
            <el-tag v-else-if="selectedEmployee.role === 1" type="warning">管理员</el-tag>
            <el-tag v-else type="info">员工</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="部门名称">{{
              selectedEmployee.departmentName || '未分配'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="当前住址" :span="2">
            {{ selectedEmployee.currentAddress || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="入职时间">
            {{ formatDate(selectedEmployee.entryTime) || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="职能描述" :span="2">
            {{ selectedEmployee.jobDescription || '未填写' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="avatar-section" v-if="selectedEmployee.avatar">
          <div class="section-header">
            <h3>员工头像</h3>
          </div>
          <div class="avatar-container">
            <el-image
                :src="formatResourceUrl(selectedEmployee.avatar)"
                fit="contain"
                :preview-src-list="[selectedEmployee.avatar]"
                style="max-width: 200px; max-height: 200px;">
            </el-image>
          </div>
        </div>

        <div class="resume-section" v-if="selectedEmployee.resumeUrl">
          <div class="section-header">
            <h3>员工简历</h3>
          </div>
          <div class="resume-container">
            <el-link :href="formatResourceUrl(selectedEmployee.resumeUrl)" type="primary" target="_blank">
              查看简历文件
            </el-link>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 新增/编辑员工对话框 -->
    <el-dialog
        v-model="formDialogVisible"
        :title="isEdit ? '编辑员工' : '新增员工'"
        width="600px"
    >
      <el-form :model="employeeForm" :rules="rules" ref="employeeFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="employeeForm.name"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="employeeForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="employeeForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="0">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="employeeForm.age" :min="18" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="employeeForm.role">
            <el-option :value="0" label="员工"></el-option>
            <el-option :value="1" label="管理员"></el-option>
            <el-option :value="2" label="经理"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-select v-model="employeeForm.departmentName">
            <el-option
                v-for="dept in departmentList"
                :key="dept.id"
                :label="dept.name"
                :value="dept.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="当前住址" prop="currentAddress">
          <el-input v-model="employeeForm.currentAddress" type="textarea" rows="3"></el-input>
        </el-form-item>
        <el-form-item label="职能描述" prop="jobDescription">
          <el-input v-model="employeeForm.jobDescription" type="textarea" rows="4"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEmployeeForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传文件对话框 -->
    <el-dialog
        v-model="uploadDialogVisible"
        title="上传文件"
        width="500px"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="上传头像" name="avatar">
          <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :on-change="handleAvatarChange"
              :show-file-list="false"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview">
            <el-icon v-else class="avatar-uploader-icon">
              <Plus/>
            </el-icon>
          </el-upload>
          <div class="upload-tip">请选择图片文件上传</div>
        </el-tab-pane>
        <el-tab-pane label="上传简历" name="resume">
          <el-upload
              class="resume-uploader"
              action="#"
              :auto-upload="false"
              :on-change="handleResumeChange"
              :file-list="resumeFileList"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                请上传PDF、Word文档格式的简历文件
              </div>
            </template>
          </el-upload>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {Plus} from '@element-plus/icons-vue';
import {
  getEmployeePage,
  getEmployeeById,
  addOrUpdateEmployee,
  deleteEmployee,
  uploadAvatar,
  uploadResume, updateEmployeeRole, getEmployeeByUserId
} from '@/api/employee';
import {useEmployeeStore} from "@/store/employeeStore";
import {getAllDepartments} from "@/api/registerApprove";

// 数据列表和分页
const loading = ref(false);
const employeeList = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const name = ref('');
const phone = ref('');

// 详情弹窗
const detailDialogVisible = ref(false);
const selectedEmployee = ref(null);

// 编辑/新增表单
const formDialogVisible = ref(false);
const isEdit = ref(false);
const employeeFormRef = ref(null);
const employeeForm = reactive({
  id: null,
  name: '',
  phone: '',
  gender: 1,
  age: 18,
  avatar: '',
  currentAddress: '',
  entryTime: '',
  resumeUrl: '',
  jobDescription: '',
  departmentId: null,
  departmentName: null,
  role: 0,
  userId: null
});
const departmentList = ref([])

// 表单验证规则
const rules = {
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
    {min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur'}
  ],
  phone: [
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
  ]
};

// 上传相关
const uploadDialogVisible = ref(false);
const activeTab = ref('avatar');
const currentEmployeeId = ref(null);
const avatarFile = ref(null);
const avatarUrl = ref('');
const resumeFile = ref(null);
const resumeFileList = ref([]);


// 获取员工列表（分页）
const fetchEmployeeList = async () => {
  loading.value = true;
  try {
    const response = await getEmployeePage(currentPage.value, pageSize.value, name.value, phone.value);
    employeeList.value = response.data.records;
    total.value = response.data.total;
    await updateEmployeeRole()
  } catch (error) {
    console.error('获取员工列表失败:', error);
    ElMessage.error('获取员工列表失败');
  } finally {
    loading.value = false;
  }
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchEmployeeList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchEmployeeList();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchEmployeeList();
};

const handleClear = () => {
  name.value = '';
  phone.value = '';
  fetchEmployeeList();
};

//获取部门列表
const fetchDepartmentList = async () => {
  const result = await getAllDepartments();
  if (result.code === 200) {
    departmentList.value = result.data
  }
};

// 查看员工详情
const viewEmployeeDetail = async (employee) => {
  loading.value = true;
  try {
    const response = await getEmployeeById(employee.id);
    console.log(response.data)
    selectedEmployee.value = response.data;
    detailDialogVisible.value = true;
  } catch (error) {
    console.error('获取员工详情失败:', error);
    ElMessage.error('获取员工详情失败');
  } finally {
    loading.value = false;
  }
};

// 编辑员工
const handleEdit = (employee) => {
  isEdit.value = true;
  fetchDepartmentList()
  Object.assign(employeeForm, employee);
  formDialogVisible.value = true;
};

// 新增员工
const openAddDialog = () => {
  fetchDepartmentList()
  isEdit.value = false;
  Object.keys(employeeForm).forEach(key => {
    if (key === 'gender') {
      employeeForm[key] = 1;
    } else if (key === 'age') {
      employeeForm[key] = 18;
    } else if (key === 'role') {
      employeeForm[key] = 0;
    } else {
      employeeForm[key] = '';
    }
  });
  formDialogVisible.value = true;
};

// 提交表单
const submitEmployeeForm = async () => {
  if (!employeeFormRef.value) return;
  await employeeFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await addOrUpdateEmployee(employeeForm);
        ElMessage.success(isEdit.value ? '修改成功' : '添加成功');
        formDialogVisible.value = false;
        await fetchEmployeeList();
      } catch (error) {
        console.error(isEdit.value ? '修改失败:' : '添加失败:', error);
        ElMessage.error(isEdit.value ? '修改失败' : '添加失败');
      } finally {
        loading.value = false;
      }
    }
  });
};

// 删除员工
const handleDelEmployee = async (id) => {
  loading.value = true;
  try {
    await deleteEmployee(id);
    ElMessage.success('删除成功');
    await fetchEmployeeList();
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  } finally {
    loading.value = false;
  }
};

// 上传文件相关
const handleUpload = (id) => {
  currentEmployeeId.value = id;
  avatarUrl.value = '';
  avatarFile.value = null;
  resumeFileList.value = [];
  resumeFile.value = null;
  uploadDialogVisible.value = true;
};

const handleAvatarChange = (file) => {
  avatarFile.value = file.raw;
  avatarUrl.value = URL.createObjectURL(file.raw);
};

const handleResumeChange = (file) => {
  resumeFile.value = file.raw;
  resumeFileList.value = [{name: file.raw.name, status: 'ready'}];
};

const submitUpload = async () => {
  if (!currentEmployeeId.value) {
    ElMessage.warning('请先选择员工');
    return;
  }

  loading.value = true;
  try {
    if (activeTab.value === 'avatar' && avatarFile.value) {
      await uploadAvatar(currentEmployeeId.value, avatarFile.value);
      ElMessage.success('头像上传成功');
    } else if (activeTab.value === 'resume' && resumeFile.value) {
      await uploadResume(currentEmployeeId.value, resumeFile.value);
      ElMessage.success('简历上传成功');
    } else {
      ElMessage.warning('请先选择文件');
      loading.value = false;
      return;
    }

    uploadDialogVisible.value = false;
    await fetchEmployeeList();
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 在 <script setup> 中定义方法
const dateFormatter = (row, column) => {
  // 获取单元格的值
  const dateTime = row[column.property];

  // 如果值为空，则返回空字符串
  if (!dateTime) return '';

  try {
    // 创建日期对象
    const date = new Date(dateTime);

    // 检查日期是否有效
    if (isNaN(date.getTime())) return dateTime;

    // 格式化日期部分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 格式化时间部分
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 返回格式化后的日期时间
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    // 如果你想要不同的格式，可以修改上面的返回值
    // 例如，只显示日期：return `${year}-${month}-${day}`;
    // 或者自定义格式：return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  } catch (error) {
    // 如果发生错误，返回原始值
    console.error('日期格式化错误:', error);
    return dateTime;
  }
};

// 在 Vue 3 组件中定义一个格式化日期的方法
const formatDate = (dateString) => {
  if (!dateString) return '未填写';

  try {
    // 处理包含T和时区的ISO格式日期
    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) return dateString;

    // 格式化为 YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // 你可以选择是否包含时间
    // 仅日期: return `${year}-${month}-${day}`;

    // 包含时间的格式
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return dateString;
  }
};

// 格式化资源URL，处理路径前缀问题
const formatResourceUrl = (url) => {
  if (!url) return '';

  // 如果已经是正确的URL格式，直接返回
  if (url.startsWith('http://localhost:8080/api')) {
    return url;
  }

  try {
    // 处理不同情况的URL
    if (url.includes('localhost:7070')) {
      // 替换7070端口为8080，并添加/api前缀
      return url.replace('localhost:7070', 'localhost:8080/api');
    } else if (url.startsWith('/')) {
      // 如果是以/开头的相对路径，添加前缀
      return `http://localhost:8080/api${url}`;
    } else if (!url.startsWith('http')) {
      // 如果不是以http开头，添加完整前缀
      return `http://localhost:8080/api/${url}`;
    }
    return url;
  } catch (e) {
    console.error('URL格式化错误:', e);
    return url;
  }
};

onMounted(() => {
  fetchEmployeeList();
});
</script>

<style scoped>
.employee-list-container {
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

h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #409eff;
}

.employee-detail {
  max-height: 600px;
  overflow-y: auto;
}

.avatar-section, .resume-section {
  margin-top: 20px;
}

.avatar-container, .resume-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 搜索区域整体样式 */
.employee-search {
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

/* 上传相关样式 */
.avatar-uploader {
  text-align: center;
  margin: 20px 0;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar-preview {
  width: 178px;
  height: 178px;
  display: block;
}

.upload-tip {
  text-align: center;
  color: #999;
  margin-top: 10px;
}

.resume-uploader {
  margin: 20px 0;
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