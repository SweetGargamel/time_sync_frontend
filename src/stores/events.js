import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { ElNotification, ElMessage } from 'element-plus'
import {
  update_user_confirmed_events_url,
  upload_LLM_events_url,
  get_updating_events_url,
  cancel_processing_url,
} from './url'

export const useEventsStore = defineStore(
  'events',
  () => {
    // 定义响应式数据
    const scheduleForms = ref([])
    const LLM_asking_events = ref([])
    const multipleSelection = ref([])
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const currentEditIndex = ref(-1)

    // 表单数据
    const scheduleForm = reactive({
      selectedGroups: [],
      selectedPersons: [],
      reason: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
    })
    // 计算是否是同一天
    const isSameDay = computed(() => {
      if (!scheduleForm.startDate || !scheduleForm.endDate) return false
      return scheduleForm.startDate.getTime() === scheduleForm.endDate.getTime()
    })
    // 处理提交
    const handleSubmit = () => {
      // 验证时间
      if (
        isSameDay.value &&
        (!scheduleForm.startTime ||
          !scheduleForm.endTime ||
          scheduleForm.endTime <= scheduleForm.startTime)
      ) {
        ElMessage.error('终止时间必须晚于开始时间')
        return
      }

      // 准备要存储的数据
      const formData = {
        selectedGroups: [...scheduleForm.selectedGroups],
        selectedPersons: [...scheduleForm.selectedPersons],
        reason: scheduleForm.reason,
        startDateTime: formatDateTime(scheduleForm.startDate, scheduleForm.startTime),
        endDateTime: formatDateTime(scheduleForm.endDate, scheduleForm.endTime),
        timestamp: new Date().toISOString(),
      }

      if (isEdit.value) {
        // 更新现有数据
        updateScheduleForm(currentEditIndex.value, formData)
        ElMessage.success('日程修改成功')
      } else {
        // 添加新数据
        createScheduleForm(formData)
        ElMessage.success('日程添加成功')
      }

      // 只清空事件原因和时间相关的信息
      scheduleForm.reason = ''
      scheduleForm.startDate = ''
      scheduleForm.startTime = ''
      scheduleForm.endDate = ''
      scheduleForm.endTime = ''

      // 重置编辑状态
      isEdit.value = false
      currentEditIndex.value = -1
      dialogVisible.value = false
    }

    // 格式化日期和时间
    const formatDateTime = (date, time) => {
      if (!date || !time) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(time.getHours()).padStart(2, '0')
      const minutes = String(time.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
    // 处理表单提交
    const submitForm = async (formEl) => {
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
          handleSubmit()
        } else {
          console.log('error submit!', fields)
        }
      })
    }

    // 处理确认
    const handleConfirm = async (index, row) => {
      try {
        // 检查是否已提交
        if (row.submitted) {
          ElMessage.warning('该事件已提交，无需重复提交')
          return
        }

        // 格式化数据
        const formattedData = {
          events: [
            {
              id: row.id,
              timestamp: new Date().toISOString(),
              reason: row.reason,
              persons: row.selectedPersons,
              start_date: row.startDateTime.split(' ')[0],
              start_time: row.startDateTime.split(' ')[1],
              end_date: row.endDateTime.split(' ')[0],
              end_time: row.endDateTime.split(' ')[1],
            },
          ],
        }

        // 发送 POST 请求
        const response = await axios.post(update_user_confirmed_events_url, formattedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // 根据状态码弹出提示框
        if (response.status === 200) {
          ElMessage.success('确认成功')
          // 更新 submitted 属性
          scheduleForms.value[index].submitted = true
        } else {
          ElMessage.error('确认失败')
        }
      } catch (error) {
        console.error('确认失败:', error)
        ElMessage.error('确认失败，请重试')
        throw error
      }
    }

    // 处理提交选中项
    const handleSubmitAll = async () => {
      try {
        // 获取选中的行
        const selectedEvents = multipleSelection.value

        if (selectedEvents.length === 0) {
          ElMessage.warning('请选择要提交的事件')
          return
        }

        // 过滤出未提交的事件
        const unsubmittedEvents = selectedEvents.filter((row) => !row.submitted)

        if (unsubmittedEvents.length === 0) {
          ElMessage.warning('所有选中的事件都已提交')
          return
        }

        // 格式化选中的事件数据
        const formattedData = {
          events: unsubmittedEvents.map((row) => ({
            id: row.id,
            timestamp: new Date().toISOString(),
            reason: row.reason,
            persons: row.selectedPersons,
            start_date: row.startDateTime.split(' ')[0],
            start_time: row.startDateTime.split(' ')[1],
            end_date: row.endDateTime.split(' ')[0],
            end_time: row.endDateTime.split(' ')[1],
          })),
        }

        // 发送 POST 请求
        const response = await axios.post(update_user_confirmed_events_url, formattedData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // 根据状态码弹出提示框
        if (response.status === 200) {
          ElMessage.success('提交成功')
          // 更新所有选中事件的 submitted 属性
          unsubmittedEvents.forEach((row) => {
            const index = scheduleForms.value.findIndex((item) => item.id === row.id)
            if (index !== -1) {
              scheduleForms.value[index].submitted = true
            }
          })
        } else {
          ElMessage.error('提交失败')
        }
      } catch (error) {
        console.error('提交失败:', error)
        throw error
      }
    }

    // 处理选中项变化
    const handleSelectionChange = (val) => {
      multipleSelection.value = val
    }

    // 处理取消或删除记录
    const handleCancel = async (index) => {
      try {
        // 检查索引是否有效
        if (index === undefined || index < 0 || index >= LLM_asking_events.value.length) {
          ElMessage.error('无效的操作')
          return
        }

        const currentEvent = LLM_asking_events.value[index]

        if (!currentEvent) {
          ElMessage.error('记录不存在')
          return
        }

        if (currentEvent.status === 'processing') {
          currentEvent.status = 'failed'
          ElMessage.success('已取消')
        } else if (currentEvent.status === 'success' || currentEvent.status === 'failed') {
          // 如果是成功或失败状态，直接删除记录
          LLM_asking_events.value.splice(index, 1)
          ElMessage.success('记录已删除')
        } else {
          ElMessage.error('取消失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败，请重试')
        throw error
      }
    }

    // 处理删除
    const handleDelete = (index) => {
      scheduleForms.value.splice(index, 1)
      ElMessage.success('删除成功')
    }

    async function cancel_processing(events) {
      try {
        const response = await axios.post(
          cancel_processing_url,
          {
            events: events,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        return response.data
      } catch (error) {
        console.error('cancel_processing failed:', error)
      }
    }
    async function post_LLM_asking_events(events) {
      try {
        const response = await axios.post(
          upload_LLM_events_url,
          {
            events: events,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        return response.data
      } catch (error) {
        console.error('LLM asking events failed:', error)
      }
    }
    async function loop_get_updating_events() {
      // 每5秒执行一次 get_updating_events 函数
      setInterval(async () => {
        await get_updating_events()
      }, 5000)
    }
    //用来查询正在更新的函数
    async function get_updating_events() {
      try {
        // 遍历 LLM_asking_events 数组
        for (const event of LLM_asking_events.value) {
          if (event.status === 'processing') {
            // 发送 GET 请求
            const response = await axios.get(`${get_updating_events_url}/${event.id}`)
            if (response.status === 404) {
              ElNotification.error({
                title: '智能提取结果',
                message: `创建于${event.timestamp}、ID 为 ${event.id} 的AI智能提取事件已失败。后台链接失败，请重新提交}`,
                position: 'bottom-right',
              })
            } else if (response.status === 200) {
              // 处理返回状态
              if (response.data.status === 'failed') {
                // 更新 LLM_asking_events 中对应元素的 status
                event.status = response.data.status
                // 弹出通知
                ElNotification.error({
                  title: '智能提取结果',
                  message: `创建于${event.timestamp}的AI智能提取事件失败。${response.data.msg}}`,
                  position: 'bottom-right',
                })
              }
              // 如果状态为 success，将 details 中的数据解构并拼接到 scheduleForms 中
              if (response.data.status === 'success') {
                for (const detail of response.data.details) {
                  const formattedData = {
                    id: detail.id,
                    timestamp: event.timestamp,
                    status: response.data.status,
                    selectedGroups: detail.groups,
                    selectedPersons: detail.persons,
                    reason: detail.reason,
                    startDateTime: `${detail.start_date} ${detail.start_time}`,
                    endDateTime: `${detail.end_date} ${detail.end_time}`,
                  }
                  scheduleForms.value.push(formattedData)
                }
                event.status = response.data.status
                // 弹出通知
                ElNotification.success({
                  title: '智能提取结果',
                  message: `创建于${event.timestamp} 的AI智能提取事件成功。${response.data.msg}}`,
                  position: 'bottom-right',
                })
              }
            } else {
              // 更新 LLM_asking_events 中对应元素的 status
              event.status = 'failed'
              // 弹出通知
              ElNotification.error({
                title: '智能提取结果',
                message: `创建于${event.timestamp}、ID 为 ${event.id} 的AI智能提取事件已失败。请重新尝试}`,
                position: 'bottom-right',
              })
            }
          }
        }
      } catch (error) {
        console.error('获取更新事件失败:', error)
      }
    }
    // 新增：更新查询参数中的组信息
    function updateQueryGroups(normalGroups, requiredGroups) {
      query_params.selectedGroups = [...normalGroups]
      query_params.requiredGroups = [...requiredGroups]
    }

    // 添加一个方法来创建新的日程表单
    function createScheduleForm(formData) {
      const newForm = {
        id: uuidv4(), // 生成唯一ID
        createTime: new Date().toISOString(), // 创建时间
        status: 'success', // 手动添加的状态为 success
        submitted: false, // 初始化 submitted 属性为 false
        ...formData,
      }
      scheduleForms.value.push(newForm)
    }

    // 添加一个方法来更新现有的日程表单
    function updateScheduleForm(index, formData) {
      const existingForm = scheduleForms.value[index]
      scheduleForms.value[index] = {
        ...existingForm,
        ...formData,
      }
    }

    return {
      // 状态
      scheduleForms,
      LLM_asking_events,
      multipleSelection,
      dialogVisible,
      isEdit,
      currentEditIndex,
      scheduleForm,
      isSameDay,
      // 方法
      update_user_confirmed_events_url,
      post_LLM_asking_events,
      cancel_processing,
      updateQueryGroups,
      createScheduleForm,
      updateScheduleForm,
      loop_get_updating_events,
      handleSubmit,
      submitForm,
      handleConfirm,
      handleSubmitAll,
      handleSelectionChange,
      formatDateTime,
      handleCancel,
      handleDelete,
    }
  },
  {
    persist: true,
  },
)
