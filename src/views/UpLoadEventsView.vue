<template>
  <div class="upload">
    <h2>录入日程信息</h2>

    <div class="user-upload card-shadow">
      <div class="user-upload-left">
        <el-form :inline="false" :model="events_store.scheduleForm" class="demo-form-inline">
          <el-form-item>
            <el-text type="warning">
              <el-icon class="warning-icon">
                <Warning />
              </el-icon>
              这里我们暂时只允许用户输入8:00-22:00的日程（与学校的上课时间段基本一致）
            </el-text>
            <el-text type="warning">
              <el-icon class="warning-icon">
                <Warning />
              </el-icon>
              您手动新增日程后需要在最下方的日程列表中再提交日程
            </el-text>

          </el-form-item>
          <el-form-item label="选择组">
            <el-select v-model="events_store.scheduleForm.selectedGroups" multiple filterable placeholder="请选择组"
              style="width: 340px">
              <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id">
                <span style="float: left">{{ group.gname }}</span>
                <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                  {{ group.id }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="选择人员">
            <el-select v-model="events_store.scheduleForm.selectedPersons" multiple filterable placeholder="请选择人员"
              style="width: 500px">
              <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
                <span style="float: left">{{ person.name }}</span>
                <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                  {{ person.id }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-button type="primary"
            @click="events_store.dialogVisible = true, events_store.isEdit = false">手动添加日程到最下方待提交区</el-button>
          <el-button type="primary" @click="showNJUAuthDialog">录入您的南大课表信息</el-button>
        </el-form>
      </div>
      <div class="user-upload-right">
        <el-input v-model="group_text" type="textarea" :autosize="{ minRows: 5, maxRows: 8 }" maxlength="1000"
          show-word-limit placeholder="请输入您的选人要求" />
        <el-button type="primary" @click="handleLLMGroup">AI智能选人</el-button>
      </div>
    </div>

    <div class="LLM-upload-section card-shadow">
      <div class="llm-flex-row">
        <!-- 智能提取日程 -->
        <div class="extract-section">
          <h3>使用Agent解析日程</h3>

          <div class="extract-header">
            <el-button class="edit-all-text" type="primary" plain size="small" @click="editDialogVisible = true">
              <el-icon>
                <Edit />
              </el-icon>
              点我编辑全文
            </el-button>
          </div>
          <el-input v-model="extractText" type="textarea" :autosize="{ minRows: 10 }" maxlength="2000" show-word-limit
            placeholder="请输入要提取的文本" />

        </div>
        <el-divider direction="vertical" class="llm-divider" />
        <!-- 上传文件部分应该放在这里 -->
        <div class="file-section">
          <h3>上传相关文档</h3>
          <el-upload v-model:file-list="filesStore.fileList" class="upload-demo llm-upload-purple" drag action="#"
            multiple :auto-upload="false" :on-change="handleFileChange" :on-remove="handleFileRemove"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                请上传 PDF, Word, PPT 或常见图片格式文件 (单个文件不超过 5MB)
              </div>
            </template>
          </el-upload>
          <el-button type="primary" style="margin-top: 10px;" @click="handleExtract">AI智能提取日程</el-button>
        </div>
      </div>
    </div>

    <!-- 编辑文本对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑文本" width="50%" draggable>
      <el-form>
        <el-form-item>
          <el-input v-model="editingText" type="textarea" :autosize="{ minRows: 10 }" maxlength="2000" show-word-limit
            placeholder="请输入要提取的文本" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleEditCancel">取消</el-button>
          <el-button type="primary" @click="handleEditConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加 LLM_asking_events 表格 -->
    <div class="table-section">
      <h3>AI正在提取的日程信息</h3>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        等待结果返回时请不要刷新界面。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        默认网页会加载您之前结果的缓存。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        目前我们的提取日程的智能体还在进一步完善，当前的效果可能不一定是最好的
      </el-text>
      <el-table :data="events_store.LLM_asking_events" border style="width: 100%;" table-layout="auto">
        <el-table-column prop="id" label="ID" width="100" :resizable="false" />
        <el-table-column prop="timestamp" label="创建时间" width="200" :resizable="false">
          <template #default="scope">
            {{ new Date(scope.row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" :resizable="false">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'success' ? 'success' :
              (scope.row.status === 'processing' ? 'info' :
                (scope.row.status === 'failed' ? 'danger' : 'info'))
              ">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="event_string" label="日程描述" min-width="300" :resizable="false" />
        <el-table-column label="涉及人员" min-width="300" :resizable="false">
          <template #default="scope">
            <el-tag v-for="personId in scope.row.persons" :key="personId" class="nju-purple"
              style="margin-right: 5px; margin-bottom: 5px;">
              {{personList.find(p => p.id === personId)?.name || personId}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="涉及组" min-width="150" :resizable="false">
          <template #default="scope">
            <el-tag v-for="groupId in scope.row.groups" :key="groupId" class="nju-purple"
              style="margin-right: 5px; margin-bottom: 5px;">
              {{groupList.find(g => g.id === groupId)?.gname || groupId}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" :resizable="false">
          <template #default="scope">
            <el-button size="small" v-if="scope.row.status === 'failed' || scope.row.status === 'processing'"
              type="danger" @click="events_store.handleCancel(scope.$index)">
              取消
            </el-button>
            <el-button size="small" v-if="scope.row.status === 'success'" type="primary"
              @click="events_store.handleCancel(scope.$index)">
              删除记录
            </el-button>
            <el-button v-if="scope.row.status === 'failed'" size="small" type="warning"
              @click="handleRetry(scope.$index)">
              重新尝试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="button-group" style="margin-top: 10px;">
        <el-button type="danger" @click="handleDeleteAllofLLM">一键删除所有</el-button>
        <el-button type="warning" @click="handleDeleteAllFailedofLLM">一键删除所有失败项</el-button>
        <el-button type="success" @click="handleDeleteAllSuccessofLLM">一键删除所有成功项</el-button>
      </div>
    </div>

    <el-divider />

    <!-- 日程表格 -->
    <div class="table-section" ref="scheduleTable">
      <h3>AI已经提取/用户手动添加的日程列表</h3>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        提交时不要刷新页面。同时用户手动新增的日程/AI提取的结果需要在此提交到后台。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        默认网页会加载您之前结果的缓存。
      </el-text>
      <el-table :data="events_store.scheduleForms" border style="width: 100%;" table-layout="auto"
        @selection-change="events_store.handleSelectionChange">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="id" label="ID" width="100" :resizable="false" />
        <el-table-column prop="timestamp" label="创建时间" width="200" :resizable="false">
          <template #default="scope">
            {{ new Date(scope.row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" :resizable="false">
          <template #default="scope">
            <el-tag :type="scope.row.submitted ? 'success' : 'info'">
              {{ scope.row.submitted ? '已提交' : '未提交' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="日程内容" width="180" :resizable="false" />
        <el-table-column label="涉及人员" min-width="300" :resizable="false">
          <template #default="scope">
            <el-tag v-for="personId in scope.row.selectedPersons" :key="personId" class="nju-purple"
              style="margin-right: 5px; margin-bottom: 5px;">
              {{personList.find(p => p.id === personId)?.name || personId}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="涉及组" min-width="150" :resizable="false">
          <template #default="scope">
            <el-tag v-for="groupId in scope.row.selectedGroups" :key="groupId" class="nju-purple"
              style="margin-right: 5px; margin-bottom: 5px;">
              {{groupList.find(g => g.id === groupId)?.gname || groupId}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDateTime" label="开始时间" width="180" :resizable="false" />
        <el-table-column prop="endDateTime" label="结束时间" width="180" :resizable="false" />

        <el-table-column label="操作" width="220" fixed="right" :resizable="false">
          <template #default="scope">
            <el-button size="small" type="primary" :disabled="scope.row.submitted"
              @click="events_store.isEdit = true; onEditClick(scope.$index, scope.row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="events_store.handleDelete(scope.$index)">
              删除
            </el-button>
            <el-button size="small" type="success" @click="handleConfirm(scope.$index, scope.row)">
              提交
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="button-group">
        <el-button type="primary" @click="handleSubmitAll">提交选中项</el-button>
        <el-button type="danger" @click="handleDeleteSelected">删除选中项</el-button>
      </div>
    </div>

    <!-- 表单对话框 -->
    <el-dialog v-model="events_store.dialogVisible" :title="events_store.isEdit ? '编辑日程' : '新增一个日程'" width="800px"
      draggable>
      <el-form :model="events_store.scheduleForm" label-width="120px" :rules="rules" ref="ruleFormRef">
        <!-- 组选择 -->
        <el-form-item label="选择组">
          <el-select v-model="events_store.scheduleForm.selectedGroups" multiple filterable placeholder="请选择组"
            style="width: 340px">
            <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id">
              <span style="float: left">{{ group.gname }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                {{ group.id }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 人员选择 -->
        <el-form-item label="涉及人员" prop="selectedPersons">
          <el-select v-model="events_store.scheduleForm.selectedPersons" multiple filterable placeholder="请选择人员"
            style="width: 500px">
            <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
              <span style="float: left">{{ person.name }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                {{ person.id }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 事件原因 -->
        <el-form-item label="事件原因" prop="reason">
          <el-input class="reason-input-height" v-model="events_store.scheduleForm.reason" type="textarea"
            :autosize="{ minRows: 2 }" :maxlength="100" show-word-limit placeholder="请输入事件原因（不超过100字）" />
        </el-form-item>

        <!-- 起始时间 -->
        <el-form-item label="起始时间" required>
          <el-col :span="11">
            <el-form-item prop="startDate">
              <el-date-picker v-model="events_store.scheduleForm.startDate" type="date" placeholder="选择日期"
                style="width: 100%" @change="handleStartDateChange" />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="startTime">
              <el-time-picker v-model="events_store.scheduleForm.startTime" format="HH:mm"
                :disabled-hours="() => [...Array(8).keys(), ...Array.from({ length: 2 }, (_, i) => i + 23)]"
                placeholder="选择时间" style="width: 100%" @change="handleStartTimeChange" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <!-- 终止时间 -->
        <el-form-item label="终止时间" required>
          <el-col :span="11">
            <el-form-item prop="endDate">
              <el-date-picker v-model="events_store.scheduleForm.endDate" type="date" placeholder="选择日期"
                style="width: 100%" :disabled-date="disabledEndDate" @change="handleEndDateChange" />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-form-item prop="endTime">
              <el-time-picker v-model="events_store.scheduleForm.endTime" format="HH:mm"
                :disabled-hours="() => [...Array(8).keys(), ...Array.from({ length: 2 }, (_, i) => i + 23)]"
                placeholder="选择时间" style="width: 100%"
                :disabled="events_store.isSameDay && !events_store.scheduleForm.startTime" />
            </el-form-item>
          </el-col>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="events_store.submitForm(ruleFormRef)">确定</el-button>
          <el-button type="success" @click="handleCancelofdialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 南大认证对话框 -->
    <el-dialog v-model="njuAuthDialogVisible" title="从教务网导入" width="650px" draggable>
      <el-form :model="NJUClassForm" ref="njuAuthFormRef" :rules="njuAuthRules">
        <el-form-item prop="warning">
          <el-text type="warning">
            <el-icon class="warning-icon">
              <Warning />
            </el-icon>
            暂时只支持本科生课表录入，我们不会记录您的账号和密码。
          </el-text>
          <el-text type="warning">
            <el-icon class="warning-icon">
              <Warning />
            </el-icon>
            请您先正确录入人员的信息（尤其是学号），否则无法导入课表。
          </el-text>
          <el-text type="warning">
            <el-icon class="warning-icon">
              <Warning />
            </el-icon>
            爬取过程中请不要刷新界面。
          </el-text>
          <el-text type="warning">
            <el-icon class="warning-icon">
              <Warning />
            </el-icon>
            如果有爬取失败的情况，可能会是因为您的课表有特殊类型的课程/网络问题。之前我们测试的时候遇到过包含单双周上课的课程导致无法正确解析的（现在已经修复）。如您还遇到类似的问题请联系我们处理
          </el-text>
        </el-form-item>
        <!-- :filter-method="handlePersonSelectOfNJUClass" -->
        <el-form-item label="选择人员" prop="selectedPerson">
          <el-select v-model="NJUClassForm.selectedPerson" filterable placeholder="可输入姓名搜索" style="width: 100%"
            @change="handlePersonSelect">
            <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
              <span style="float: left">{{ person.name }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                {{ person.id }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学号" prop="user_name">
          <el-input v-model="NJUClassForm.user_name" placeholder="请输入学号" disabled />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="NJUClassForm.password" type="password" placeholder="请输入统一身份认证密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="njuAuthDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleNJUAuthSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useEventsStore } from '../stores/events'
import { usePersonGroupStore } from '@/stores/persongroup'
import { ElMessage, ElLoading } from 'element-plus'
import { useNjuCrawler } from '@/hooks/nju_crawler.js'
import { useFilesStore } from '@/stores/files'
import { useFileUploader } from '@/hooks/file_uploader'
import { useLLMFormGroup } from '@/hooks/LLM_form_group'

import { v4 as uuidv4 } from 'uuid'
import { Edit, Warning } from '@element-plus/icons-vue'

const events_store = useEventsStore()
const person_group_store = usePersonGroupStore()
const groupList = computed(() => person_group_store.group_list)
const personList = computed(() => person_group_store.person_list)

const filesStore = useFilesStore()
const { uploadFile } = useFileUploader()

const scheduleTable = ref(null)
// 定义表单引用
const ruleFormRef = ref()
// Destructure from the new hook
const {
  njuAuthDialogVisible,
  NJUClassForm,
  njuAuthRules,
  njuAuthFormRef,
  handlePersonSelect,
  showNJUAuthDialog,
  handleNJUAuthSubmit
} = useNjuCrawler(personList)
// 定义验证规则
const rules = reactive({
  selectedPersons: [
    { required: true, message: '请选择涉及人员', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入事件原因', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
})
// 选择框控制
const selectable = (row) => !row.submitted

// 添加一个标志位来防止循环触发
const Lock_Normal_Groups = ref(false)
const Lock_Normal_Persons = ref(false)
// 编辑对话框相关
const editDialogVisible = ref(false)
const editingText = ref('')
const handleConfirm = async (index, row) => {
  if (!scheduleTable.value) {
    ElMessage.error('表格未正确加载')
    return
  }

  const loadingInstance3 = ElLoading.service({
    target: scheduleTable.value,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })

  try {
    await events_store.handleConfirm(index, row)
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    loadingInstance3.close()
  }
}

const handleSubmitAll = async () => {
  const loadingInstance4 = ElLoading.service({
    target: scheduleTable.value,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  try {
    await events_store.handleSubmitAll()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loadingInstance4.close()
  }
}

// 处理开始日期变化
const handleStartDateChange = () => {
  // 如果结束日期早于开始日期，则清空结束日期
  if (events_store.scheduleForm.endDate && events_store.scheduleForm.endDate < events_store.scheduleForm.startDate) {
    events_store.scheduleForm.endDate = ''
    events_store.scheduleForm.endTime = ''
  }
}

// 处理开始时间变化
const handleStartTimeChange = () => {
  if (events_store.isSameDay && events_store.scheduleForm.endTime && events_store.scheduleForm.endTime <= events_store.scheduleForm.startTime) {
    events_store.scheduleForm.endTime = ''
    ElMessage.warning('终止时间必须晚于开始时间')
  }
}

// 处理结束日期变化
const handleEndDateChange = () => {
  if (events_store.isSameDay && events_store.scheduleForm.endTime && events_store.scheduleForm.endTime <= events_store.scheduleForm.startTime) {
    events_store.scheduleForm.endTime = ''
    ElMessage.warning('终止时间必须晚于开始时间')
  }
}

// 禁用结束日期选择
const disabledEndDate = (time) => {
  if (!events_store.scheduleForm.startDate) return false
  return time.getTime() < events_store.scheduleForm.startDate.getTime()
}

// 处理编辑
const handleEdit = (index, row) => {
  events_store.currentEditIndex = index
  // 填充表单数据
  events_store.scheduleForm.selectedGroups = [...row.selectedGroups]
  events_store.scheduleForm.selectedPersons = [...row.selectedPersons]
  events_store.scheduleForm.reason = row.reason

  // 解析日期时间
  const parseDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: null, time: null }
    const [datePart, timePart] = dateTimeStr.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes] = timePart.split(':').map(Number)
    return {
      date: new Date(year, month - 1, day),
      time: new Date(0, 0, 0, hours, minutes)
    }
  }

  const start = parseDateTime(row.startDateTime)
  const end = parseDateTime(row.endDateTime)

  events_store.scheduleForm.startDate = start.date
  events_store.scheduleForm.startTime = start.time
  events_store.scheduleForm.endDate = end.date
  events_store.scheduleForm.endTime = end.time

  events_store.dialogVisible = true
}

const handleCancelofdialog = function () {
  events_store.dialogVisible = false

  events_store.currentEditIndex = -1  // 重置编辑索引
}

// 辅助函数：判断人员是否存在于其他选中组
const isPersonInGroups = (personId, selectedGroups) => {
  return selectedGroups.some(groupId => {
    const group = groupList.value.find(g => g.id === groupId)
    return group?.gperson?.includes(personId)
  })
}

// 辅助函数：判断组是否完全选中
const isGroupFullySelected = (groupId, selectedPersons) => {
  const group = groupList.value.find(g => g.id === groupId)
  return group?.gperson?.every(p => selectedPersons.includes(p)) || false
}

// 监听组的变化
watch(() => events_store.scheduleForm.selectedGroups, async (newGroups, oldGroups = []) => {
  if (Lock_Normal_Groups.value) return
  Lock_Normal_Persons.value = true

  try {
    // 新增组处理
    const addedGroups = newGroups.filter(g => !oldGroups.includes(g))
    if (addedGroups.length) {
      const newPersons = addedGroups.flatMap(g =>
        groupList.value.find(grp => grp.id === g)?.gperson || []
      )
      events_store.scheduleForm.selectedPersons = [
        ...new Set([...events_store.scheduleForm.selectedPersons, ...newPersons])
      ]
    }

    // 移除组处理
    const removedGroups = oldGroups.filter(g => !newGroups.includes(g))
    if (removedGroups.length) {
      const personsToCheck = removedGroups.flatMap(g =>
        groupList.value.find(grp => grp.id === g)?.gperson || []
      )

      await nextTick()

      const toRemove = personsToCheck.filter(p =>
        !isPersonInGroups(p, newGroups)
      )

      events_store.scheduleForm.selectedPersons =
        events_store.scheduleForm.selectedPersons.filter(p => !toRemove.includes(p))
    }
  } finally {
    setTimeout(() => {
      Lock_Normal_Persons.value = false
    }, 100)
  }
}, { deep: true })

// 监听人员的变化
watch(() => events_store.scheduleForm.selectedPersons, async (newPersons, oldPersons = []) => {
  if (Lock_Normal_Persons.value) return
  Lock_Normal_Groups.value = true

  try {
    // 移除人员处理
    const removedPersons = oldPersons.filter(p => !newPersons.includes(p))
    if (removedPersons.length) {
      const affectedGroups = [
        ...new Set(removedPersons.flatMap(p =>
          personList.value.find(per => per.id === p)?.belong_group || []
        ))
      ]

      await nextTick()

      const groupsToRemove = affectedGroups.filter(g =>
        events_store.scheduleForm.selectedGroups.includes(g) &&
        !isGroupFullySelected(g, newPersons)
      )

      events_store.scheduleForm.selectedGroups =
        events_store.scheduleForm.selectedGroups.filter(g => !groupsToRemove.includes(g))
    }

    // 新增人员处理
    const addedPersons = newPersons.filter(p => !oldPersons.includes(p))
    if (addedPersons.length) {
      await nextTick()

      const candidateGroups = [
        ...new Set(addedPersons.flatMap(p =>
          personList.value.find(per => per.id === p)?.belong_group || []
        ))
      ]

      const groupsToAdd = candidateGroups.filter(g =>
        !events_store.scheduleForm.selectedGroups.includes(g) &&
        isGroupFullySelected(g, newPersons)
      )

      events_store.scheduleForm.selectedGroups = [
        ...new Set([...events_store.scheduleForm.selectedGroups, ...groupsToAdd])
      ]
    }
  } finally {
    setTimeout(() => {
      Lock_Normal_Groups.value = false
    }, 100)
  }
}, { deep: true })

// 打开编辑对话框时，将当前文本复制到编辑区
watch(() => editDialogVisible.value, (newVal) => {
  if (newVal) {
    editingText.value = extractText.value
  }
})

// 处理编辑确认
const handleEditConfirm = () => {
  extractText.value = editingText.value
  editDialogVisible.value = false
}

// 处理编辑取消
const handleEditCancel = () => {
  editDialogVisible.value = false
}

// 定义提取文本的响应式变量
const extractText = ref('')

// 处理智能提取日程
const handleExtract = async () => {
  try {
    // 检查文本框内容是否为空
    if (!extractText.value.trim()) {
      ElMessage.warning('请输入要提取的文本')
      return
    }

    // 检查人员选择器是否为空
    if (events_store.scheduleForm.selectedPersons.length === 0) {
      ElMessage.warning('请选择涉及人员')
      return
    }

    // 上传所有文件
    const filesToUpload = filesStore.fileList
    console.log('上传文件列表:', filesStore.fileList)
    const uploadedFileIds = []
    for (const fileItem of filesToUpload) {
      try {
        const result = await uploadFile(fileItem, filesStore)
        // 只有在文件真正上传成功后才添加到 uploadedFileIds
        if (result && fileItem.status === 'success') {
          uploadedFileIds.push(fileItem.id)
          ElMessage.success(`${fileItem.name} 上传成功`)
        }
      } catch (error) {
        console.error(`文件 ${fileItem.name} 上传失败:`, error)
        ElMessage.error(`${fileItem.name} 上传失败`)
      }
    }

    // 生成唯一ID和时间戳
    const id = uuidv4()
    const timestamp = new Date().toISOString()

    // 创建 LLM_asking_event 对象
    const LLM_asking_event = {
      id: id,
      timestamp: timestamp,
      status: 'processing',
      event_string: extractText.value,
      persons: events_store.scheduleForm.selectedPersons,
      groups: events_store.scheduleForm.selectedGroups,
      files: uploadedFileIds
    }

    // 发送请求
    await events_store.post_LLM_asking_events([LLM_asking_event])

    // 将对象添加到 LLM_asking_events 数组
    events_store.LLM_asking_events.push(LLM_asking_event)

    // 清空文本框和文件列表
    extractText.value = ''
    filesStore.fileList = []
    filesStore.file_id_list = []

    ElMessage.success('提交成功，请耐心等待结果')
  } catch (error) {
    console.error('提取失败:', error)
    ElMessage.error('提取失败，请重试')
  }
}

// 处理重新尝试
const handleRetry = async (index) => {
  try {
    // 获取当前记录
    const currentEvent = events_store.LLM_asking_events[index]

    // 创建新的记录，保留必要信息
    const newEvent = {
      id: uuidv4(), // 生成新的唯一ID
      timestamp: new Date().toISOString(), // 使用当前时间
      status: 'processing',
      event_string: currentEvent.event_string,
      persons: [...currentEvent.persons],
      groups: [...currentEvent.groups],
      files: [...currentEvent.files] // 保留文件ID
    }

    // 发送请求
    await events_store.post_LLM_asking_events([newEvent])

    // 将新记录添加到 LLM_asking_events 数组
    events_store.LLM_asking_events.push(newEvent)

    ElMessage.success('已重新提交，请耐心等待结果')
  } catch (error) {
    console.error('重新提交失败:', error)
    ElMessage.error('重新提交失败，请重试')
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await Promise.all([
    person_group_store.query_group_list(),
    person_group_store.query_person_list()
  ])
})

// 编辑按钮点击事件，已提交则提示
const onEditClick = (index, row) => {
  if (row.submitted) {
    ElMessage.warning('该日程已提交，无法再编辑！')
    return
  }
  handleEdit(index, row)
}

// 一键删除所有
const handleDeleteAllofLLM = () => {
  // 从后往前遍历，避免删除时索引变化
  for (let i = events_store.LLM_asking_events.length - 1; i >= 0; i--) {
    events_store.handleCancel(i)
  }
  ElMessage.success('已删除所有记录')
}

// 一键删除所有失败项
const handleDeleteAllFailedofLLM = () => {
  // 从后往前遍历，避免删除时索引变化
  for (let i = events_store.LLM_asking_events.length - 1; i >= 0; i--) {
    if (events_store.LLM_asking_events[i].status === 'failed') {
      events_store.handleCancel(i)
    }
  }
  ElMessage.success('已删除所有失败记录')
}

// 一键删除所有成功项
const handleDeleteAllSuccessofLLM = () => {
  // 从后往前遍历，避免删除时索引变化
  for (let i = events_store.LLM_asking_events.length - 1; i >= 0; i--) {
    if (events_store.LLM_asking_events[i].status === 'success') {
      events_store.handleCancel(i)
    }
  }
  ElMessage.success('已删除所有成功记录')
}

// 删除选中项
const handleDeleteSelected = () => {
  // 获取选中的行
  const selectedEvents = events_store.multipleSelection

  if (selectedEvents.length === 0) {
    ElMessage.warning('请选择要删除的事件')
    return
  }

  // 从后往前遍历，避免删除时索引变化
  for (let i = events_store.scheduleForms.length - 1; i >= 0; i--) {
    // 检查当前行是否在选中项中
    if (selectedEvents.some(event => event.id === events_store.scheduleForms[i].id)) {
      events_store.handleDelete(i)
    }
  }
  ElMessage.success('已删除选中项')
}

// --- 文件上传相关 --- 
const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp'
];
const maxFileSize = 5 * 1024 * 1024; // 5MB
// const maxFileSize = 500 * 1024 * 1024; // 5MB


const handleFileChange = (uploadFile, uploadFiles) => {
  // 仅在文件状态为 'ready' (新添加) 时处理
  if (uploadFile.status === 'ready') {
    if (!allowedFileTypes.includes(uploadFile.raw.type)) {
      ElMessage.error(`文件格式不支持: ${uploadFile.name}`);
      // 从 el-upload 的列表中移除，并通过 uid 从 store 中移除
      const internalFileIndex = filesStore.fileList.findIndex(f => f.uid === uploadFile.uid);
      if (internalFileIndex !== -1) {
        filesStore.removeFileByUid(uploadFile.uid);
      }
      // 更新 el-upload 内部维护的列表
      const elUploadListIndex = uploadFiles.findIndex(f => f.uid === uploadFile.uid);
      if (elUploadListIndex > -1) {
        uploadFiles.splice(elUploadListIndex, 1);
      }
      return;
    }

    if (uploadFile.raw.size > maxFileSize) {
      ElMessage.error(`文件 ${uploadFile.name} 太大，超过 5MB 限制`);
      const internalFileIndex = filesStore.fileList.findIndex(f => f.uid === uploadFile.uid);
      if (internalFileIndex !== -1) {
        filesStore.removeFileByUid(uploadFile.uid);
      }
      const elUploadListIndex = uploadFiles.findIndex(f => f.uid === uploadFile.uid);
      if (elUploadListIndex > -1) {
        uploadFiles.splice(elUploadListIndex, 1);
      }
      return;
    }

    // 如果文件已存在于 store (基于 el-upload 的 uid)，则不重复添加
    if (!filesStore.getFileByUid(uploadFile.uid)) {
      const addedFile = filesStore.addFile(uploadFile.raw);
      // 更新 el-upload 内部列表项的 uid 和 id
      uploadFile.uid = addedFile.uid;
      uploadFile.id = addedFile.id;
    }
  }
};

const handleFileRemove = (uploadFile, uploadFiles) => {
  // uploadFile 是被移除的文件对象
  filesStore.removeFileByUid(uploadFile.uid);
  ElMessage.success(`移除了文件: ${uploadFile.name}`);
};

const { sendLLMFormGroupRequest } = useLLMFormGroup()
const group_text = ref('')

const handleLLMGroup = async () => {
  if (!group_text.value.trim()) {
    ElMessage.warning('请输入选人要求')
    return
  }

  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在处理中，请稍候...',
    background: 'rgba(0, 0, 0, 0.7)'
  })

  try {
    const response = await sendLLMFormGroupRequest(group_text.value)
    print(response)
    // 清空原有选择
    console.log(events_store.scheduleForm.selectedPersons)
    events_store.scheduleForm.selectedPersons = []
    // 添加新选择的人员
    console.log(events_store.scheduleForm.selectedPersons)

    events_store.scheduleForm.selectedPersons = response.persons
    console.log(events_store.scheduleForm.selectedPersons)

    ElMessage.success('AI选人成功')
  } catch (error) {
    console.error('AI选人失败:', error)
    ElMessage.error('AI选人失败，请重试')
  } finally {
    loadingInstance.close()
  }
}

</script>

<style scoped>
.upload {
  padding: 20px;
  padding-right: 100px;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
}

.upload h2 {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-shadow {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 20px;
}

.user-upload {
  margin-bottom: 32px;
  display: flex;
  gap: 24px;
}

.user-upload-left {
  flex: 1;
  min-width: 0;
}

.user-upload-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-form-inline {
  background-color: transparent;
  padding: 0;
  margin: 0;
}

.llm-flex-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0;
  /* min-height: 400px; */
}

.extract-section {
  flex: 1;
  min-width: 0;
  margin-right: 0;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.file-section {
  flex: 1;
  min-width: 0;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.llm-divider {
  margin: 0;
  height: auto !important;
  align-self: stretch;
}

.llm-upload-purple {
  --el-color-primary: #824082 !important;
  --el-upload-dragger-border-color: #824082 !important;
  --el-upload-dragger-bg-color: #f3e6f7 !important;
  --el-upload-dragger-hover-border-color: #824082 !important;
  --el-upload-list-hover-bg-color: #f3e6f7 !important;
}

:deep(.el-upload) {
  --el-color-primary: #824082 !important;
}

:deep(.el-upload__text) {
  color: #824082 !important;
}

:deep(.el-upload__tip) {
  color: #824082 !important;
}

:deep(.el-upload-list__item) {
  background: #f3e6f7 !important;
  border-color: #824082 !important;
  color: #824082 !important;
}

:deep(.el-upload-list__item .el-icon--close) {
  color: #824082 !important;
}

:deep(.el-upload-dragger) {
  border: 2px dashed #824082 !important;
  background: #f3e6f7 !important;
  color: #824082 !important;
}

:deep(.el-upload-dragger:hover) {
  border-color: #824082 !important;
  background: #e0c6e6 !important;
}

.upload-button-group {
  margin-top: 15px;
}

/* 保留警告文本和图标样式 */
.warning-text {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #e6a23c;
  padding: 8px 16px;
  background-color: #fdf6ec;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.warning-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 保留紫色主题按钮、标签等样式 */
:deep(.el-button--primary) {
  background-color: #824082 !important;
  border-color: #824082 !important;
  color: #fff !important;
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  background-color: #fff !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-button--primary.is-plain) {
  background-color: #824082 !important;
  color: #fff !important;
  border-color: #824082 !important;
}

:deep(.el-button--primary.is-plain:hover),
:deep(.el-button--primary.is-plain:focus) {
  background-color: #fff !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-button--info) {
  background-color: #f3e6f7 !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-button--info:hover),
:deep(.el-button--info:focus) {
  background-color: #e0c6e6 !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-button--warning) {
  background-color: #824082 !important;
  border-color: #824082 !important;
  color: #fff !important;
}

:deep(.el-button--success) {
  background-color: #f3e6f7 !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-button--success:hover),
:deep(.el-button--success:focus) {
  background-color: #e0c6e6 !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-tag.nju-purple) {
  background-color: #f3e6f7 !important;
  color: #824082 !important;
  border-color: #824082 !important;
}

:deep(.el-select-dropdown__item.selected),
:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item.is-hover) {
  background-color: #f3e6f7 !important;
  color: #824082 !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 2px #82408233 !important;
  border-color: #824082 !important;
}

:deep(.el-select .el-input__wrapper) {
  border-color: #824082 !important;
}

:deep(.el-dialog__footer .el-button:not(.el-button--primary):hover) {
  box-shadow: 0 2px 8px 0 #82408233 !important;
  border-color: #824082 !important;
  color: #824082 !important;
}

/* 删除无用样式，保留核心结构和主题色相关部分 */
.edit-all-text {
  margin-bottom: 15px;
}

:deep(.el-divider--vertical) {
  height: 100%
}
</style>