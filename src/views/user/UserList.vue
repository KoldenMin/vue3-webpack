<template>
  <div class="user-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
        </div>
      </template>

      <el-alert
          title="管理员功能"
          type="info"
          description="这里显示了系统中所有注册用户的信息列表"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
      />

      <div class="user-search">
        <div class="search-container">
          <el-input placeholder="用户名查询" v-model="username"></el-input>
          <el-input placeholder="姓名查询" v-model="realName"></el-input>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="danger" @click="handleClear">清空</el-button>
        </div>
      </div>

      <el-table
          v-loading="loading"
          :data="userList"
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
            prop="username"
            label="用户名"
            width="120"
        />

        <el-table-column
            prop="realName"
            label="姓名"
            width="120"
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
            prop="phone"
            label="电话"
            width="150"
        />

        <el-table-column
            prop="currentAddress"
            label="当前住址"
            min-width="200"
            show-overflow-tooltip
        />

        <el-table-column
            prop="isAdmin"
            label="管理员"
            width="80"
            align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.isAdmin === 1" type="danger" effect="dark">是</el-tag>
            <el-tag v-else effect="plain">否</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="status"
            label="状态"
            width="80"
            align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success" effect="dark">正常</el-tag>
            <el-tag v-else type="info" effect="dark">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column
            prop="createTime"
            label="注册时间"
            width="180"
            align="center"
            :formatter="dateFormatter"
        />

        <el-table-column
            label="操作"
            width="500"
            align="center"
        >
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                @click="viewUserDetail(scope.row)"
            >
              查看详情
            </el-button>
            <el-popconfirm title="设为管理员？" @confirm="handleSetAsAdmin(scope.row.id)">
              <template #reference>
                <el-button type="warning" size="small">设为管理员</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="确认删除？" @confirm="handleDelUser(scope.row.id)">
              <template #reference>
                <el-button type="danger" size="small">删除用户</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[2,3,5,10,20]"
            :size="size"
            :disabled="disabled"
            :background="background"
            layout="sizes, prev, pager, next"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="用户详情"
        width="700px"
    >
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ selectedUser.realName }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ selectedUser.gender === 1 ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ selectedUser.age }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ selectedUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="是否管理员">{{ selectedUser.isAdmin === 1 ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="当前住址" :span="2">{{
              selectedUser.currentAddress || '未填写'
            }}
          </el-descriptions-item>
          <el-descriptions-item label="入职时间">
            {{ selectedUser.entryTime ? dateFormatter(null, null, selectedUser.entryTime) : '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ dateFormatter(null, null, selectedUser.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="职能描述" :span="2">
            {{ selectedUser.jobDescription || '未填写' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="education-section">
          <div class="section-header">
            <h3>教育背景</h3>
          </div>

          <div v-if="selectedUser.educationList && selectedUser.educationList.length > 0">
            <el-timeline>
              <el-timeline-item
                  v-for="(edu, index) in selectedUser.educationList"
                  :key="index"
                  :timestamp="getEducationPeriod(edu)"
                  placement="top"
              >
                <el-card>
                  <h4>{{ edu.school }} - {{ edu.major }}</h4>
                  <p v-if="edu.degree">学位: {{ edu.degree }}</p>
                  <p v-if="edu.description">{{ edu.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          <el-empty v-else description="暂无教育背景信息"/>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import {getUserList, getUserInfo, getUserPage, deleteUser} from '@/api/user';
import {getEducationList} from '@/api/education';
import {Cancel} from "axios";


const loading = ref(false);
const userList = ref([]);
const dialogVisible = ref(false);
const selectedUser = ref(null);

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const size = ref(0)
const username = ref('')
const realName = ref('')
const background = ref(false)
const disabled = ref(false)


const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchPageUserList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchPageUserList()
}

const handleSearch = () => {
  fetchPageUserList()
}

const handleClear = () => {
  username.value = ''
  realName.value = ''
  fetchPageUserList()
}

const handleSetAsAdmin = (id) => {
  console.log(id)
}

const handleDelUser = async (id) => {
  try {
    await deleteUser(id)
    ElMessage({
      type: 'success',
      message: '删除用户成功'
    })

    await fetchPageUserList()
  } catch (error) {
    // 处理错误情况
    ElMessage({
      type: 'error',
      message: '删除用户失败: ' + error.message
    })
  }
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const response = await getUserList();
    userList.value = response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取用户列表
const fetchPageUserList = async () => {
  loading.value = true;
  try {
    const response = await getUserPage(currentPage.value, pageSize.value, username.value, realName.value);
    userList.value = response.data.records
    total.value = response.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看用户详情
const viewUserDetail = async (user) => {
  loading.value = true;
  try {
    // 这里获取用户的详细信息，包括教育背景等
    // 假设后端提供了获取指定用户信息的接口
    // 由于我们没有获取特定用户信息的API，这里做个模拟
    selectedUser.value = {...user};

    // 模拟获取该用户的教育背景
    const eduResponse = await getEducationList(); // 这里应该传递用户ID参数
    selectedUser.value.educationList = eduResponse.data || [];

    dialogVisible.value = true;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    ElMessage.error('获取用户详情失败');
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

// 获取教育经历起止时间
const getEducationPeriod = (edu) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const start = edu.startDate ? formatDate(edu.startDate) : '';
  const end = edu.endDate ? formatDate(edu.endDate) : '至今';
  return `${start} 至 ${end}`;
};

onMounted(() => {
  fetchPageUserList()
  // getUserPage(currentPage.value, pageSize.value)
  // fetchUserList();
});
</script>

<style scoped>
.user-list-container {
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

.user-detail {
  max-height: 600px;
  overflow-y: auto;
}

.education-section {
  margin-top: 20px;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 搜索区域整体样式 */
.user-search {
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