<template>
    <div class="change-events-view" ref="changeEventsViewRef">
        <h2>查看与修改日程</h2>

        <div class="controls-container">
            <el-form :inline="true" class="filter-form">
                <el-form-item label="选择人员">
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
                <div class="slider-demo-block">
                    <span class="demonstration">时间格高度</span>
                    <el-slider v-model="timeCellHeight" :min="80" :max="175" :step="5"
                        style="flex: 0 0 70%; max-width: 300px;" />
                </div>
            </el-form>

        </div>

        <div class="calendar-container">
            <vue-cal :events="change_event_store.events" :time-from="8 * 60" :time-to="22 * 60"
                :views="['days', 'week', 'month', 'year']" :time-cell-height="timeCellHeight" active-view="week"
                locale="zh-cn" watch-real-time :disable-views="['years', 'year']" @view-change="handleViewChange"
                @ready="onReady" @event-click="openEventDialog" ref="vueCalRef">
                <template #event-content="{ event }">
                    <div :style="{
                        // background: event.backgroundColor, // 使用事件自带的背景色
                        borderRadius: '10px',
                        minHeight: '60px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        padding: '5px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        color: '#fff', // 文字颜色设为白色以便在紫色背景上显示
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }" class="custom-event-block">
                        <div class="vuecal__event-title">{{ event.title }}</div>
                        <div class="event-divider" style="border-top: 1px solid rgba(255,255,255,0.5); margin: 3px 0;">
                        </div>
                        <div class="vuecal__event-content" style="font-size: 10px;">{{ event.content }}</div>
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
                    <el-button @click="showEventDialog = false">关闭</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueCal, addDatePrototypes } from 'vue-cal'
import 'vue-cal/style'
import { ElMessage, ElLoading, ElSelect, ElOption, ElSlider, ElDialog, ElButton, ElIcon, ElForm, ElFormItem } from 'element-plus'
import { Calendar, Clock } from '@element-plus/icons-vue'
import { usePersonGroupStore } from '@/stores/persongroup'
import { useChangeEventStore } from '@/stores/change_event' // 新创建的 store


addDatePrototypes()

const person_group_store = usePersonGroupStore()
const change_event_store = useChangeEventStore()

const personList = computed(() => person_group_store.person_list)

const timeCellHeight = ref(90)
const vueCalRef = ref(null) // Ref for VueCal instance
const changeEventsViewRef = ref(null) // Ref for the main div for loading

const showEventDialog = ref(false)
const selectedEvent = ref(null)

let loadingInstance = null

const currentView = ref({})
watch(() => change_event_store.isLoading, (newVal) => {
    if (newVal) {
        if (!loadingInstance && changeEventsViewRef.value) {
            loadingInstance = ElLoading.service({
                target: changeEventsViewRef.value,
                text: '正在加载日程数据...',
                background: 'rgba(255, 255, 255, 0.7)'
            })
        }
    } else {
        if (loadingInstance) {
            loadingInstance.close()
            loadingInstance = null
        }
    }
})


const onReady = ({ view }) => {
    currentView.value.start = view.start
    currentView.value.end = view.end
}

// const handlePersonChange = async (personId) => {
//     change_event_store.setSelectedPerson(personId) // 更新 store 中的 selectedPersonId
//     if (personId && vueCalRef.value) {
//         await change_event_store.fetchEvents(personId, currentView.start, currentView.end)
//     } else if (!personId) {
//         change_event_store.events.value = [] // 清空事件
//     }
// }

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

</script>

<style scoped>
.change-events-view {
    padding: 20px 40px;
    min-height: 100vh;
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
</style>