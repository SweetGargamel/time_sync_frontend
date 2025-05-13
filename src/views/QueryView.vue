<template>
  <div class="query" ref="Query_div_def">
    <h2>预定日程</h2>
    <div class="search-form">
      <el-form :inline="true" class="demo-form-inline">
        <div>
          <div class="select-with-ai">
            <div class="select-left">
              <el-form-item label="选择组">
                <el-select v-model="query_store.query_params.selectedGroups" multiple filterable placeholder="请选择组"
                  :clearable="true" style="width: 200px">
                  <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id">
                    <span style="float: left">{{ group.gname }}</span>
                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                      {{ group.id }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="参会人员">
                <el-select v-model="query_store.query_params.selectedPersons" multiple filterable placeholder="请选择人员"
                  :clearable="true" style="width: 500px">
                  <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
                    <span style="float: left">{{ person.name }}</span>
                    <span style="
                          float: right;
                          color: var(--el-text-color-secondary);
                          font-size: 13px;
                        ">
                      {{ person.id }}
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>

            <div class="ai-right">
              <el-input v-model="normal_person_text" type="textarea" :autosize="{ minRows: 5, maxRows: 7 }"
                maxlength="1000" show-word-limit placeholder="请输入您的选人要求" />
              <el-button type="primary" @click="handleNormalLLMPerson">AI智能选人</el-button>
            </div>
          </div>
        </div>
        <el-divider />

        <div class="select-with-ai">
          <div class="select-left">
            <el-form-item label="必须参加组">
              <el-select v-model="query_store.query_params.requiredGroups" multiple filterable placeholder="请选择组"
                :clearable="true" style="width: 200px">
                <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id">
                  <span style="float: left">{{ group.gname }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    {{ group.id }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="必须参会人员">
              <el-select v-model="query_store.query_params.requiredPersons" multiple filterable placeholder="请选择人员"
                :clearable="true" style="width: 500px">
                <el-option v-for="person in personList" :key="person.id" :label="person.name" :value="person.id">
                  <span style="float: left">{{ person.name }}</span>
                  <span style="
                          float: right;
                          color: var(--el-text-color-secondary);
                          font-size: 13px;
                        ">
                    {{ person.id }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>

          <div class="ai-right">
            <el-input v-model="required_person_text" type="textarea" :autosize="{ minRows: 5, maxRows: 7 }"
              maxlength="1000" show-word-limit placeholder="请输入您的选人要求" />
            <el-button type="primary" @click="handleRequiredLLMPerson">AI智能选人</el-button>
          </div>
        </div>
        <el-divider />
        <el-form-item label="日期范围">
          <el-date-picker v-model="query_store.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" />
        </el-form-item>
        <el-form-item label="时间段">
          <el-input-number v-model="query_store.query_params.duration" :min="0.5" :max="10" :step="0.5" step-strictly>
            <template #suffix>
              <span>小时</span>
            </template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="具体需求">
          <el-input v-model="query_store.query_params.user_need" type="textarea" :autosize="{ minRows: 3, maxRows: 15 }"
            maxlength="1000" show-word-limit placeholder="用自然语言输入您的要求，比如不希望时间在早八" style="width: 600px" />
        </el-form-item>
        <el-form-item>
          <div class="search-button-group">
            <el-button type="primary" @click="onSearch" class="search-button">
              <el-icon>
                <Search />
              </el-icon>
              <span>查询</span>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!-- 推荐时间段表格 -->
    <div class="recommend-table" style="margin-top: 40px;">
      <h3>推荐时间段</h3>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        等待查询时请不要刷新界面。我们这里只推荐满足必须参加者能参加的时间段。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        默认网页会加载您上一次查询结果的缓存，您可以再次点击查询按钮来查询。
      </el-text>
      <el-table :data="query_store.recommendTableData" stripe border style="width: 100%">
        <el-table-column prop="start_time" label="开始时间" width="180" :resizable="false" align="center" />
        <el-table-column prop="end_time" label="结束时间" width="180" :resizable="false" align="center" />
        <el-table-column prop="availableCount" label="能来的人数" width="140" :resizable="false" align="center" />
        <el-table-column prop="unavailablePeople" label="不能来的人" min-width="250" :resizable="false"
          show-overflow-tooltip />
      </el-table>
    </div>
    <div class="slider-demo-block">
      <span class="demonstration">时间格高度</span>
      <el-slider v-model="timeCellHeight" :min="80" :max="175" :step="5" style="flex: 0 0 70%;" />
    </div>
    <div class="calendar-container">
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        等待查询时请不要刷新界面。结果返回后请跳转到正确的日期查看结果。点击下方每一个区块可以查看具体该时段人员的空闲情况。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        下图越接近绿色的区块可参会率为越高（深绿色为100%），越接近红色的参会率越低（大红色为60%和以下）。若必须参会者无法参加，则系统计算可参会率为0%。
      </el-text>
      <el-text class="warning-text" type="warning">
        <el-icon class="warning-icon">
          <Warning />
        </el-icon>
        默认网页会加载您上一次查询结果的缓存，您可以再次点击查询按钮来查询。
      </el-text>

      <vue-cal :events="query_store.events" :time-from="8 * 60" :time-to="22 * 60"
        :views="['days', 'week', 'month', 'year']" :time-cell-height="timeCellHeight" time-at-cursor watch-real-time
        locale="zh-cn" @event-click="openEventDialog">
        <template #event-content="{ event }">
          <div :style="{
            background: `linear-gradient(90deg, ${event.backgroundColor} 80%, #fff0 100%)`,
            borderRadius: '10px',
            minHeight: '60px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            padding: '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s, transform 0.2s'
          }" class="custom-event-block">
            <div class="vuecal__event-title">
              {{ event.title }}
            </div>
            <div class="event-divider"></div>
            <div class="vuecal__event-content">
              {{ event.content }}
            </div>
          </div>
        </template>
      </vue-cal>
    </div>

    <!-- 事件详情对话框 -->
    <el-dialog v-model="showEventDialog" :title="selectedEvent?.title" width="500px" :close-on-click-modal="false">
      <div class="event-dialog-content">
        <div class="event-time">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>{{ selectedEvent?.start?.toLocaleDateString() }}</span>
          <el-icon class="ml-2">
            <Clock />
          </el-icon>
          <span>{{ selectedEvent?.start?.toLocaleTimeString() }} - {{ selectedEvent?.end?.toLocaleTimeString() }}</span>
        </div>
        <div class="event-details mt-4">
          <pre>{{ selectedEvent?.contentFull }}</pre>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEventDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { VueCal, addDatePrototypes } from 'vue-cal'
import 'vue-cal/style'
import { ElMessage, ElLoading } from 'element-plus'
import { useQueryStore } from '../stores/query'
import { usePersonGroupStore } from '@/stores/persongroup'
import { Search, Calendar, Clock, Warning } from '@element-plus/icons-vue'
import { useLLMFormGroup } from '@/hooks/LLM_form_group'

// 添加日期原型方法
addDatePrototypes()

const query_store = useQueryStore()
const person_group_store = usePersonGroupStore()
const groupList = computed(() => person_group_store.group_list)
const personList = computed(() => person_group_store.person_list)

// AI选人相关的响应式变量
const normal_person_text = ref('')
const required_person_text = ref('')

// 获取AI选人方法
const { sendLLMFormGroupRequest } = useLLMFormGroup()

const is_handleing_normal_person_ai = ref(false)
// 处理普通人员AI选人
const handleNormalLLMPerson = async () => {
  if (is_handleing_normal_person_ai.value) {
    ElMessage.warning('请等待上一次AI选人完成')
  } else {
    is_handleing_normal_person_ai.value = true
    if (!normal_person_text.value) {
      ElMessage.warning('请输入选人要求')
      return
    }

    try {
      const data = await sendLLMFormGroupRequest(normal_person_text.value)
      if (data && data.person_ids) {
        query_store.query_params.selectedPersons = data.person_ids
        ElMessage.success('AI选人成功')
      }
    } catch (error) {
      ElMessage.error('AI选人失败：' + error.message)
    } finally {

      is_handleing_normal_person_ai.value = false
    }
  }
}

// 处理必须参加组AI选人
const is_handleing_required_person_ai = ref(false)
const handleRequiredLLMPerson = async () => {
  if (is_handleing_required_person_ai.value) {
    ElMessage.warning('请等待上一次AI选人完成')
  } else {
    is_handleing_required_person_ai.value = true

    if (!required_person_text.value) {
      ElMessage.warning('请输入选人要求')
      return
    }

    try {
      const data = await sendLLMFormGroupRequest(required_person_text.value)
      if (data && data.group_ids) {
        query_store.query_params.requiredGroups = data.group_ids
        ElMessage.success('AI选人成功')
      }
    } catch (error) {
      ElMessage.error('AI选人失败：' + error.message)
    } finally {

      is_handleing_required_person_ai.value = false
    }

  }
}


const timeCellHeight = ref(90)

// 添加一个标志位来防止循环触发
const Lock_Normal_Groups = ref(false)
const Lock_Normal_Persons = ref(false)
const Lock_Required_Groups = ref(false)
const Lock_Required_Persons = ref(false)

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

// 组件挂载时，如果 store 中有数据则直接处理显示
onMounted(async () => {
  await Promise.all([
    person_group_store.query_group_list(),
    person_group_store.query_person_list()
  ])
})

const Query_div_def = ref(null)

const onSearch = async () => {
  if (!query_store.dateRange || query_store.dateRange.length !== 2) {
    ElMessage.warning('请选择日期范围')
    return
  }

  if (query_store.query_params.selectedPersons.length === 0 && query_store.query_params.requiredPersons.length === 0) {
    ElMessage.warning('请选择参会人员或必须参会人员')
    return
  }

  // 为推荐表格和日历添加loading
  const loadingInstance1 = ElLoading.service({
    target: Query_div_def.value,
    text: '加载中...',
    background: 'rgba(255, 255, 255, 0.7)'
  })

  try {
    await query_store.query_time_slots(personList)
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error(error.message || '查询失败，请重试')
  } finally {
    loadingInstance1.close()
  }

  // 更新日历视图到选择的日期范围
  const calendarEl = document.querySelector('.vuecal')
  if (calendarEl && calendarEl.__vue__) {
    const calendar = calendarEl.__vue__
    calendar.switchView('week', new Date(query_store.query_params.startDate))
  }
}

// 监听普通组的变化
watch(() => query_store.query_params.selectedGroups, async (newGroups, oldGroups = []) => {
  if (Lock_Normal_Groups.value) return
  Lock_Normal_Persons.value = true

  try {
    // 新增组处理
    const addedGroups = newGroups.filter(g => !oldGroups.includes(g))
    if (addedGroups.length) {
      const newPersons = addedGroups.flatMap(g =>
        groupList.value.find(grp => grp.id === g)?.gperson || []
      )
      query_store.query_params.selectedPersons = [
        ...new Set([...query_store.query_params.selectedPersons, ...newPersons])
      ]
    }

    // 移除组处理
    const removedGroups = oldGroups.filter(g => !newGroups.includes(g))
    if (removedGroups.length) {
      const personsToCheck = removedGroups.flatMap(g =>
        groupList.value.find(grp => grp.id === g)?.gperson || []
      )

      // 需要等待DOM更新后再检查状态
      await nextTick()

      const toRemove = personsToCheck.filter(p =>
        !isPersonInGroups(p, newGroups) // 检查是否存在于其他组
      )

      query_store.query_params.selectedPersons =
        query_store.query_params.selectedPersons.filter(p => !toRemove.includes(p))
    }
  } finally {
    setTimeout(() => {
      Lock_Normal_Persons.value = false
    }, 100) // 稍作延迟确保状态同步
  }
}, { deep: true })

// 监听普通参会人员的变化
watch(() => query_store.query_params.selectedPersons, async (newPersons, oldPersons = []) => {
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
        query_store.query_params.selectedGroups.includes(g) &&
        !isGroupFullySelected(g, newPersons)
      )

      query_store.query_params.selectedGroups =
        query_store.query_params.selectedGroups.filter(g => !groupsToRemove.includes(g))
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
        !query_store.query_params.selectedGroups.includes(g) &&
        isGroupFullySelected(g, newPersons)
      )

      query_store.query_params.selectedGroups = [
        ...new Set([...query_store.query_params.selectedGroups, ...groupsToAdd])
      ]
    }
  } finally {
    setTimeout(() => {
      Lock_Normal_Groups.value = false
    }, 100)
  }
}, { deep: true })

// 监听必须参会组的变化
watch(() => query_store.query_params.requiredGroups, async (newGroups, oldGroups = []) => {
  if (Lock_Required_Groups.value) return
  Lock_Required_Persons.value = true

  try {
    // 新增组处理
    const addedGroups = newGroups.filter(g => !oldGroups.includes(g))
    if (addedGroups.length) {
      const newPersons = addedGroups.flatMap(g =>
        groupList.value.find(grp => grp.id === g)?.gperson || []
      )
      query_store.query_params.requiredPersons = [
        ...new Set([...query_store.query_params.requiredPersons, ...newPersons])
      ]
      // 同时添加到普通参会人员列表
      query_store.query_params.selectedPersons = [
        ...new Set([...query_store.query_params.selectedPersons, ...newPersons])
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

      query_store.query_params.requiredPersons =
        query_store.query_params.requiredPersons.filter(p => !toRemove.includes(p))
    }
  } finally {
    setTimeout(() => {
      Lock_Required_Persons.value = false
    }, 100)
  }
}, { deep: true })

// 监听必须参会人员的变化
watch(() => query_store.query_params.requiredPersons, async (newPersons, oldPersons = []) => {
  if (Lock_Required_Persons.value) return
  Lock_Required_Groups.value = true

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
        query_store.query_params.requiredGroups.includes(g) &&
        !isGroupFullySelected(g, newPersons)
      )

      query_store.query_params.requiredGroups =
        query_store.query_params.requiredGroups.filter(g => !groupsToRemove.includes(g))
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
        !query_store.query_params.requiredGroups.includes(g) &&
        isGroupFullySelected(g, newPersons)
      )

      query_store.query_params.requiredGroups = [
        ...new Set([...query_store.query_params.requiredGroups, ...groupsToAdd])
      ]

      // 新增逻辑：如果普通参会人员列表中没有该人员，则将其添加进去
      query_store.query_params.selectedPersons = [
        ...new Set([...query_store.query_params.selectedPersons, ...addedPersons])
      ]
    }
  } finally {
    setTimeout(() => {
      Lock_Required_Groups.value = false
    }, 100)
  }
}, { deep: true })

const showEventDialog = ref(false)
const selectedEvent = ref(null)

const openEventDialog = ({ event }) => {
  selectedEvent.value = event
  showEventDialog.value = true
}
</script>

<style scoped>
.query {
  padding: 20px 40px;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  padding-right: 100px;
  /* background-color: #f5f7fa; */
}

.search-form {
  margin: 20px 0;
  padding: 32px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.search-button-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-button {
  padding: 12px 24px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(130, 64, 130, 0.2);
}

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

.recommend-table {
  margin: 20px 0;
  padding: 32px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.recommend-table h3 {
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  position: relative;
  padding-left: 12px;
}

.recommend-table h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #824082;
  border-radius: 2px;
}

.slider-demo-block {
  margin: 20px 0;
  padding: 32px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 24px;
}

.slider-demo-block .demonstration {
  min-width: 140px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.calendar-container {
  margin: 20px 0;
  padding: 32px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 14px;
  padding: 16px 0;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 32px;
  margin-bottom: 24px;
}

:deep(.el-input-number) {
  width: 180px;
}

:deep(.el-date-editor) {
  width: 360px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-button--primary) {
  background-color: #824082 !important;
  border-color: #824082 !important;
  color: #fff !important;
}

:deep(.el-button--primary:hover) {
  background-color: #9c5c9c !important;
  border-color: #9c5c9c !important;
}

:deep(.el-slider__bar) {
  background-color: #824082 !important;
}

:deep(.el-slider__button) {
  border-color: #824082 !important;
}

:deep(.vuecal__weekdays-headings) {
  background-color: #f5f7fa !important;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background-color: var(--el-fill-color-light) !important;
}

.vuecal {
  height: 60%;
  --vuecal-primary-color: #824082;
}

:deep(.vuecal__cell) {
  border-color: var(--el-border-color-lighter) !important;
}

:deep(.vuecal__heading) {
  font-weight: 600;
  color: var(--el-text-color-primary);
  padding: 16px 0;
}

:deep(.vuecal__event) {
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none !important;
  padding: 12px !important;
  transition: all 0.3s ease;
}

:deep(.vuecal__event:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.vuecal__event-title) {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 12px;
}

:deep(.vuecal__event-content) {
  font-size: 11px;
  line-height: 1.5;
  /* color: var(--el-text-color-regular); */
}

.event-dialog-content {
  padding: 24px;
}

.event-time {
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
  font-size: 14px;
  margin-bottom: 16px;
}

.event-time .el-icon {
  margin-right: 8px;
  color: #824082;
}

.event-details {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  font-size: 14px;
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.mt-4 {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
}

.select-with-ai {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.select-left {
  flex: 0 0 700px;
  max-width: 700px;
}

.ai-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 300px;
  margin-left: 0;
}

.ai-right .el-button {
  align-self: flex-end;
}
</style>