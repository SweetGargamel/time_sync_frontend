<template>
    <div class="change-events-view" ref="changeEventsViewRef">
        <h2>查看与修改日程</h2>
        <div class="top-controls">
            <h3>使用AI来帮你进行日程的修改</h3>

            <div class="LLM-change-events">

                <div class="form-group-left">
                    <el-input v-model="group_text" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }"
                        maxlength="1000" show-word-limit placeholder="请输入您的选人要求" />
                    <el-form :inline="false" class="demo-form-inline">
                        <el-form-item label="选择组">
                            <el-select v-model="selectedGroups" multiple filterable placeholder="请选择组"
                                style="width: 340px" clearable>
                                <el-option v-for="group in groupList" :key="group.id" :label="group.gname"
                                    :value="group.id">
                                    <span style="float: left">{{ group.gname }}</span>
                                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                                        {{ group.id }}
                                    </span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="选择人员">
                            <el-select v-model="selectedPersons" multiple filterable placeholder="请选择人员"
                                style="width: 500px" clearable>
                                <el-option v-for="person in personList" :key="person.id" :label="person.name"
                                    :value="person.id">
                                    <span style="float: left">{{ person.name }}</span>
                                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                                        {{ person.id }}
                                    </span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <el-button type="primary" @click="handleLLMGroup" :loading="loading">AI智能选人</el-button>
                </div>
                <div class="form-group-right">
                    <el-input v-model="user_need" type="textarea" :autosize="{ minRows: 8, maxRows: 12 }"
                        maxlength="2000" show-word-limit placeholder="请输入您的日程修改要求" />
                    <el-button type="primary" @click="handleLLMChangeEvents" :loading="loading">让AI帮你修改日程</el-button>
                </div>
            </div>

        </div>
        <div class="controls-container">
            <el-form :inline="true" class="filter-form">
                <el-form-item label="选择要查看日程的人员">
                    <el-select v-model="change_event_store.selectedPersonId" filterable placeholder="请选择人员"
                        style="width: 250px" clearable>
                        <el-option v-for="person in personList" :key="person.id" :label="person.name"
                            :value="person.id">
                            <span style="float: left">{{ person.name }}</span>
                            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px;">
                                {{ person.id }}
                            </span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>

                    <div class="slider-demo-block">
                        <span class="demonstration">时间格高度</span>
                        <el-slider v-model="timeCellHeight" :min="60" :max="120" :step="5"
                            style="flex: 0 0 70%; max-width: 300px;" />
                    </div>
                </el-form-item>

            </el-form>

        </div>
    </div>
    <div class="calendar-container">
        <vue-cal :events="change_event_store.events" :time-from="8 * 60" :time-to="22 * 60"
            :views="['days', 'week', 'month', 'year']" :time-cell-height="timeCellHeight" active-view="week"
            locale="zh-cn" watch-real-time :disable-views="['years', 'year']" @view-change="handleViewChange"
            @ready="onReady" @event-click="openEventDialog" ref="vueCalRef">
            <template #event-content="{ event }">
                <div :style="{
                    borderRadius: '14px',
                    minHeight: '70px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #824082 80%, #a678b4 100%)',
                    color: '#fff',
                    overflow: 'hidden'
                }" class="custom-event-block">
                    <div class="vuecal__event-title" style="font-size: 24px; font-weight: bold; margin-bottom: 6px;">
                        {{ event.title }}
                    </div>
                    <div class="event-divider"
                        style="border-top: 1px solid rgba(255,255,255,0.3); margin: 4px 0 8px 0;"></div>
                    <div class="vuecal__event-content"
                        style="font-size: 15px; line-height: 1.7; word-break: break-all; white-space: pre-line;">
                        {{ event.content }}
                    </div>
                </div>
            </template>
        </vue-cal>
    </div>

    <!-- 事件详情对话框 -->
    <el-dialog v-model="showEventDialog" :title="selectedEvent?.title || '事件详情'" width="500px"
        :close-on-click-modal="false">
        <div class="event-dialog-content" v-if="selectedEvent">
            <div class="event-time">
                <el-icon>
                    <Calendar />
                </el-icon>
                <span>{{ selectedEvent.start?.toLocaleDateString() }}</span>
                <el-icon class="ml-2">
                    <Clock />
                </el-icon>
                <span>{{ selectedEvent?.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} -
                    {{
                        selectedEvent?.end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
            </div>
            <div class="event-details mt-4">
                <pre>{{ selectedEvent.contentFull }}</pre>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="danger" @click="handleDeleteEvent" :loading="deleteLoading">删除事件</el-button>
                <el-button @click="showEventDialog = false">关闭</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueCal, addDatePrototypes } from 'vue-cal'
import 'vue-cal/style'
import { ElMessage, ElLoading, ElSelect, ElOption, ElSlider, ElDialog, ElButton, ElIcon, ElForm, ElFormItem } from 'element-plus'
import { Calendar, Clock } from '@element-plus/icons-vue'
import { usePersonGroupStore } from '@/stores/persongroup'
import { useChangeEventStore } from '@/stores/change_event'
import { useLLMFormGroup } from '@/hooks/LLM_form_group'

addDatePrototypes()

const person_group_store = usePersonGroupStore()
const change_event_store = useChangeEventStore()
const { sendLLMFormGroupRequest } = useLLMFormGroup()

const personList = computed(() => person_group_store.person_list)
const groupList = computed(() => person_group_store.group_list)

// 响应式变量
const timeCellHeight = ref(90)
const vueCalRef = ref(null)
const changeEventsViewRef = ref(null)
const showEventDialog = ref(false)
const selectedEvent = ref(null)
const loading = ref(false)
const group_text = ref('')
const user_need = ref('')
const selectedGroups = ref([])
const selectedPersons = ref([])

// 锁变量，防止循环触发
const Lock_Normal_Groups = ref(false)
const Lock_Normal_Persons = ref(false)

// 修改 currentView 的定义
const currentView = ref({
    start: null,
    end: null
})

const deleteLoading = ref(false)

// 处理AI智能选人
const handleLLMGroup = async () => {
    if (!group_text.value.trim()) {
        ElMessage.warning('请输入选人要求')
        return
    }

    loading.value = true
    const loadingInstance = ElLoading.service({
        target: '.form-group-left',
        text: '正在处理中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
        print(group_text.value)
        const response = await sendLLMFormGroupRequest(group_text.value)
        print(response)
        selectedPersons.value = response.persons
        ElMessage.success('AI选人成功')
    } catch (error) {
        console.error('AI选人失败:', error)
        ElMessage.error('AI选人失败，请重试')
    } finally {
        loading.value = false
        loadingInstance.close()
    }
}

// 修改 handleLLMChangeEvents 中的 currentView 引用
const handleLLMChangeEvents = async () => {
    if (!user_need.value.trim()) {
        ElMessage.warning('请输入日程修改要求')
        return
    }
    if (selectedPersons.value.length === 0) {
        ElMessage.warning('请选择相关人员')
        return
    }

    loading.value = true
    const loadingInstance = ElLoading.service({
        target: '.form-group-right',
        text: '正在处理中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    })

    try {
        const response = await change_event_store.LLM_change_events_action(user_need.value, selectedPersons.value)
        if (response.status === 200) {
            ElMessage.success(response.msg || '修改成功')
            // 刷新日程数据
            if (change_event_store.selectedPersonId && currentView.value.start && currentView.value.end) {
                await change_event_store.fetchEvents(
                    change_event_store.selectedPersonId,
                    currentView.value.start,
                    currentView.value.end
                )
            }
        } else {
            ElMessage.error(response.data.msg || '修改失败')
        }
    } catch (error) {
        console.error('修改日程失败:', error)
        ElMessage.error('修改日程失败，请重试')
    } finally {
        loading.value = false
        loadingInstance.close()
    }
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
watch(() => selectedGroups.value, async (newGroups, oldGroups = []) => {
    if (Lock_Normal_Groups.value) return
    Lock_Normal_Persons.value = true

    try {
        // 新增组处理
        const addedGroups = newGroups.filter(g => !oldGroups.includes(g))
        if (addedGroups.length) {
            const newPersons = addedGroups.flatMap(g =>
                groupList.value.find(grp => grp.id === g)?.gperson || []
            )
            selectedPersons.value = [
                ...new Set([...selectedPersons.value, ...newPersons])
            ]
        }

        // 移除组处理
        const removedGroups = oldGroups.filter(g => !newGroups.includes(g))
        if (removedGroups.length) {
            const personsToCheck = removedGroups.flatMap(g =>
                groupList.value.find(grp => grp.id === g)?.gperson || []
            )

            const toRemove = personsToCheck.filter(p =>
                !isPersonInGroups(p, newGroups)
            )

            selectedPersons.value =
                selectedPersons.value.filter(p => !toRemove.includes(p))
        }
    } finally {
        setTimeout(() => {
            Lock_Normal_Persons.value = false
        }, 100)
    }
}, { deep: true })

// 监听人员的变化
watch(() => selectedPersons.value, async (newPersons, oldPersons = []) => {
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

            const groupsToRemove = affectedGroups.filter(g =>
                selectedGroups.value.includes(g) &&
                !isGroupFullySelected(g, newPersons)
            )

            selectedGroups.value =
                selectedGroups.value.filter(g => !groupsToRemove.includes(g))
        }

        // 新增人员处理
        const addedPersons = newPersons.filter(p => !oldPersons.includes(p))
        if (addedPersons.length) {
            const candidateGroups = [
                ...new Set(addedPersons.flatMap(p =>
                    personList.value.find(per => per.id === p)?.belong_group || []
                ))
            ]

            const groupsToAdd = candidateGroups.filter(g =>
                !selectedGroups.value.includes(g) &&
                isGroupFullySelected(g, newPersons)
            )

            selectedGroups.value = [
                ...new Set([...selectedGroups.value, ...groupsToAdd])
            ]
        }
    } finally {
        setTimeout(() => {
            Lock_Normal_Groups.value = false
        }, 100)
    }
}, { deep: true })

const onReady = ({ view }) => {
    currentView.value.start = view.start
    currentView.value.end = view.end
}

const handleViewChange = async (view) => {
    currentView.value.start = view.start
    currentView.value.end = view.end
    if (change_event_store.selectedPersonId) {
        await change_event_store.fetchEvents(change_event_store.selectedPersonId, view.start.format(), view.end.format())
    }
}

const openEventDialog = ({ event }) => { // event 参数由 vue-cal 直接提供
    selectedEvent.value = event
    showEventDialog.value = true
}

// Watch for changes in selectedPersonId from the store (e.g., if set by other components or persisted state)
watch(() => change_event_store.selectedPersonId, (newPersonId) => {
    change_event_store.selectedPersonId = newPersonId; // Sync local ref with store's state
    if (newPersonId && vueCalRef.value) {
        change_event_store.fetchEvents(newPersonId, currentView.start, currentView.end);
    } else if (!newPersonId) {
        change_event_store.events.value = [];
    }
});

// 添加删除事件的处理函数
const handleDeleteEvent = async () => {
    if (!selectedEvent.value) return

    try {
        deleteLoading.value = true
        const response = await change_event_store.delete_events_action([selectedEvent.value.id])

        if (response.code === 200) {
            ElMessage.success('事件删除成功')
            showEventDialog.value = false

            // 刷新日程数据
            if (change_event_store.selectedPersonId && currentView.value.start && currentView.value.end) {
                await change_event_store.fetchEvents(
                    change_event_store.selectedPersonId,
                    currentView.value.start,
                    currentView.value.end
                )
            }
        } else {
            ElMessage.error(response.msg || '删除失败')
        }
    } catch (error) {
        console.error('删除事件失败:', error)
        ElMessage.error('删除事件失败，请重试')
    } finally {
        deleteLoading.value = false
    }
}

</script>

<style scoped>
.change-events-view {
    padding: 20px 40px;
    /* min-height: 100vh; */
    max-width: 1600px;
    margin: 0 auto;
    /* background-color: #f5f7fa; */
}

.controls-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    gap: 20px;
    flex-wrap: wrap;
}

.filter-form .el-form-item {
    margin-bottom: 0;
    /* Remove bottom margin for inline form items */
}

.slider-demo-block {
    display: flex;
    align-items: center;
    gap: 15px;
    /* Reduced gap */
}

.slider-demo-block .demonstration {
    min-width: 100px;
    /* Adjusted width */
    font-size: 14px;
    color: var(--el-text-color-regular);
}

.calendar-container {
    margin: 20px 0;
    padding: 32px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    height: 100vh;
    /* Default height, can be adjusted */
}

.vuecal {
    height: 100%;
    /* Fill the container */
    --vuecal-primary-color: #824082;
    /* Using the purple color */
    --vuecal-event-background-color: #824082;
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
    /* padding: 12px !important; */
    /* Padding is now on custom-event-block */
    transition: all 0.3s ease;
    cursor: pointer;
}

:deep(.vuecal__event:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.vuecal__event-title) {
    font-weight: 600;
    /* margin-bottom: 8px; */
    /* Adjusted margin */
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.vuecal__event-content) {
    font-size: 11px;
    line-height: 1.3;
    /* Adjusted line height */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:deep(.vuecal__weekdays-headings) {
    background-color: #f5f7fa !important;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

/* Event Dialog Styles (copied from QueryView and adapted) */
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
    /* Purple color for icons */
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

/* Ensure Select dropdown style matches if needed */
:deep(.el-select-dropdown__item.selected) {
    color: #824082 !important;
    font-weight: bold;
}

.LLM-change-events {
    display: flex;
    gap: 24px;
    margin: 20px 0;
    padding: 20px;
    background-color: #fff;
    border-radius: 12px;
    /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
}

.top-controls {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    background-color: #fff;
    gap: 24px;
    margin: 20px 0;
    padding: 20px;
}


.form-group-left,
.form-group-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group-left .el-form {
    margin-top: 16px;
}

.form-group-left .el-button,
.form-group-right .el-button {
    align-self: flex-start;
    margin-top: 8px;
}

:deep(.el-textarea__inner) {
    border-color: #824082;
}

:deep(.el-textarea__inner:focus) {
    border-color: #824082;
    box-shadow: 0 0 0 2px rgba(130, 64, 130, 0.2);
}

:deep(.el-form-item__label) {
    color: #824082;
}

:deep(.el-select .el-input__wrapper) {
    border-color: #824082;
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px rgba(130, 64, 130, 0.2);
}

:deep(.el-select-dropdown__item.selected) {
    color: #824082;
    font-weight: bold;
}

:deep(.el-select-dropdown__item.hover) {
    background-color: #f3e6f7;
}
</style>