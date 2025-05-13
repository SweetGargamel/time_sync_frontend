import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios, { all } from 'axios'
import { view_events_url, LLM_change_events } from './url'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

export const useChangeEventStore = defineStore('changeEvent', () => {
  const events = ref([])
  const isLoading = ref(false)
  let selectedPersonId = ref(null)
  const allRawEvents = ref([]) // 用于存储原始的、未处理的事件数据

  // 辅助函数：将API返回的事件数据转换为 VueCal 组件需要的格式
  function processRawEvents(rawEvents) {
    if (!rawEvents || !Array.isArray(rawEvents)) {
      return []
    }
    function process_time(datePart, timePart) {
      const [year, month, day] = datePart.split('-').map(Number)
      const [hour, minute] = timePart.split(':').map(Number)
      const date = new Date(year, month - 1, day, hour, minute)
      return date
    }
    return rawEvents.map((event) => {
      const startTime = process_time(event.start_date, event.start_time)
      const endTime = process_time(event.end_date, event.end_time)

      return {
        id: event.id,
        start: startTime,
        end: endTime,
        title: event.reason,
        content: event.reason,
        contentFull: `原因: ${event.reason}\n开始: ${event.start_date} ${event.start_time}\n结束: ${event.end_date} ${event.end_time}`,
        backgroundColor: '#824082', // 固定紫色
        // rawEvent: event, // 保存原始事件，方便后续操作
      }
    })
  }

  async function fetchEvents(personId, viewStartDate, viewEndDate) {
    if (!personId) {
      events.value = []
      allRawEvents.value = []
      return
    }
    isLoading.value = true
    try {
      const formattedStartDate = dayjs(viewStartDate).format('YYYY-MM-DD')
      const formattedEndDate = dayjs(viewEndDate).format('YYYY-MM-DD')

      const response = await axios.post(view_events_url, {
        id: personId,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      })

      if (response.status === 200 && response.data && response.data.events) {
        allRawEvents.value = response.data.events // 存储原始事件
        events.value = processRawEvents(response.data.events)
        console.log(allRawEvents)
        console.log(events.value)
        ElMessage.success('日程数据已更新')
      } else {
        ElMessage.error(response.data?.msg || '获取日程数据失败')
        allRawEvents.value = []
        events.value = []
      }
    } catch (error) {
      console.error('获取日程数据错误:', error)
      ElMessage.error('获取日程数据时发生网络错误或服务器错误')
      allRawEvents.value = []
      events.value = []
    } finally {
      isLoading.value = false
    }
  }

  function setSelectedPerson(personId) {
    selectedPersonId.value = personId
    // 清空当前事件，等待新的获取指令
    events.value = []
    allRawEvents.value = []
  }

  // 获取原始事件数据，用于后续的修改和删除操作
  function getRawEventById(eventId) {
    return allRawEvents.value.find((event) => event.id === eventId)
  }

  // 添加LLM修改日程的action
  async function LLM_change_events_action(user_need, persons_ids) {
    try {
      const response = await axios.post(LLM_change_events, {
        user_need,
        persons: persons_ids,
      })
      return response.data
    } catch (error) {
      console.error('修改日程失败:', error)
      throw error
    }
  }

  return {
    events,
    isLoading,
    selectedPersonId,
    allRawEvents,
    fetchEvents,
    setSelectedPerson,
    getRawEventById,
    LLM_change_events_action,
  }
})
