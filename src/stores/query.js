import { ref, reactive, computed, nextTick } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { query_schedul_url } from './url'
import { ElMessage } from 'element-plus'

export const useQueryStore = defineStore(
  'query',
  () => {
    const query_result = ref([])
    // 日历事件数据
    const events = ref([])
    // 推荐时间段表格数据
    const recommendTableData = ref([])
    const query_params = reactive({
      selectedGroups: [], // 选择的组
      requiredGroups: [], // 必须参加的组
      selectedPersons: [], // 选择的人员
      requiredPersons: [], // 必须参加的人员
      startDateInISO: '', // 开始日期
      endDateInISO: '', // 结束日期
      duration: 1, // 时间段
      user_need: '', // 用户输入的文本
      // suggest_count_want: 10, // 期望的最大返回推荐时间段数量
    })

    // 颜色插值函数：根据可参会率返回渐变色
    function getEventColor(rate) {
      if (rate === undefined || isNaN(rate)) return '#ff0000'
      if (rate <= 0.6) return '#ff0000' // 红色
      if (rate >= 1) return '#008000' // 100% 深绿色
      // 60%~99% 渐变 #ff0000 -> #66ff99
      // #ff0000 (255,0,0) -> #66ff99 (102,255,153)
      const start = [255, 0, 0]
      const end = [102, 255, 153]
      // 0.6~0.99 映射到 0~1
      const percent = (rate - 0.6) / 0.39
      const r = Math.round(start[0] + (end[0] - start[0]) * percent)
      const g = Math.round(start[1] + (end[1] - start[1]) * percent)
      const b = Math.round(start[2] + (end[2] - start[2]) * percent)
      return `rgb(${r},${g},${b})`
    }

    // 添加日期范围计算属性
    const dateRange = computed({
      get() {
        if (query_params.startDateInISO && query_params.endDateInISO) {
          return [new Date(query_params.startDateInISO), new Date(query_params.endDateInISO)]
        }
        return []
      },
      set(value) {
        if (value && value.length === 2) {
          query_params.startDateInISO = value[0].toISOString()
          query_params.endDateInISO = value[1].toISOString()
        } else {
          query_params.startDateInISO = ''
          query_params.endDateInISO = ''
        }
      },
    })

    // 处理事件数据
    function processEvents(PersonList) {
      events.value.splice(0, events.value.length)
      function process_time(datePart, timePart) {
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute] = timePart.split(':').map(Number)
        const date = new Date(year, month - 1, day, hour, minute)
        return date
      }

      function findPersonName(id) {
        const person = PersonList.value.find(function (p) {
          return p.id === id
        })
        return person ? person.name : id
      }

      if (!query_result.value || !query_result.value.time_slots) {
        console.error('time_slots is undefined:', query_result.value)
        return
      }
      console.log('query_result.value.time_slots', query_result.value.time_slots)
      query_result.value.time_slots.forEach((slot) => {
        const date = slot.date
        slot.time_intervals.forEach((interval) => {
          // 将字符串格式的时间转换为 Date 对象
          const startTime = process_time(date, interval.start)
          const endTime = process_time(date, interval.end)
          const weight = interval.weight
          const unavailable_people = interval.unavailable_people
          const unavailable_must_people = interval.unavailable_must_people
          const available_people_count = interval.available_people_count
          // 计算可参会率
          let availableRate = 0
          const total = available_people_count + unavailable_people.length
          if (unavailable_must_people.length === 0 && total > 0) {
            availableRate = available_people_count / total
          } else if (unavailable_must_people.length > 0 && total > 0) {
            availableRate = 0
          } else {
            availableRate = 0
          }

          let unavailable_people_str = ''
          let unavailable_must_people_str = ''
          if (interval.unavailable_people.length > 0) {
            unavailable_people_str = `${unavailable_people.length}位无法参加`
            if (unavailable_must_people.length > 0) {
              unavailable_must_people_str = `其中${unavailable_must_people.length}位是必须参会者`
            } else {
              unavailable_must_people_str = '所有必须参会者均可参会'
            }
          } else {
            unavailable_people_str = '全员均可参会'
          }
          const content = `${available_people_count}人可参会 \n ${unavailable_people_str} \n ${unavailable_must_people_str}`

          events.value.push({
            start: startTime,
            end: endTime,
            title: `可参会率${(availableRate * 100).toFixed(2)}%`,
            content: content,
            contentFull:
              `时间段：${interval.start} - ${interval.end}\n` +
              `可参会人数：${available_people_count}\n` +
              `不可参会人数：${unavailable_people.length}\n` +
              `不可参会人员：${unavailable_people.map(findPersonName).join('、')}\n` +
              `必须参会者不可参会人数：${unavailable_must_people.length}\n` +
              `必须参会者不可参会人员：${unavailable_must_people.map(findPersonName).join('、')}\n` +
              `可参会率：${(availableRate * 100).toFixed(2)}%`,
            date: date,
            availableRate: availableRate,
            backgroundColor: getEventColor(availableRate),
          })
        })
      })
    }

    // 处理推荐时间数据
    function processRecommend(PersonList) {
      if (!query_result.value || !query_result.value.suggest_time) {
        recommendTableData.value = []
        ElMessage.warning('对于您选择的时间范围，没有满足所有必须参会人必须到的解')
        return
      }

      console.log('query_result.value.suggest_time', query_result.value.suggest_time)
      recommendTableData.value = query_result.value.suggest_time.map(function (slot) {
        function findPersonName(id) {
          const person = PersonList.value.find(function (p) {
            return p.id === id
          })
          return person ? person.name : id
        }
        return {
          // 将字符串格式的时间转换为 Date 对象
          start_time: slot.start_time,
          end_time: slot.end_time,
          availableCount: slot.available_people_count,
          unavailablePeople: slot.unavailable_people.map(findPersonName).join('、'),
        }
      })
    }

    // 修改：查询时间槽的异步函数，同时保存查询参数和结果
    async function query_time_slots(PersonList) {
      function formatDate(date) {
        if (!(date instanceof Date)) {
          date = new Date(date)
        }
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      try {
        // 保存查询参数
        const response = await axios.post(
          query_schedul_url,
          {
            start_day: formatDate(query_params.startDateInISO),
            end_day: formatDate(query_params.endDateInISO),
            persons: query_params.selectedPersons,
            must_persons: query_params.requiredPersons,
            duration_time: query_params.duration,
            user_need: query_params.user_need,
            // suggest_count_want: query_params.suggest_count_want,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        if (response.status === 200) {
          query_result.value = response.data
          // 处理返回的数据
          console.log('Query_result:', query_result.value.time_slots)

          processEvents(PersonList)
          // debugger
          processRecommend(PersonList)
          ElMessage.success('查询成功')
        } else {
          ElMessage.error(response?.msg || '查询失败')
          throw new Error(response.data.msg || '查询失败')
        }
      } catch (error) {
        console.error('获取时间槽失败:', error)
        throw error
      }
    }
    return {
      query_time_slots,
      query_result,
      query_params,
      dateRange,
      events,
      recommendTableData,
    }
  },
  {
    persist: {
      pick: ['query_params', 'events', 'recommendTableData'],
      storage: localStorage,
      serializer: {
        serialize: JSON.stringify,
        deserialize: (value) => {
          const parsed = JSON.parse(value)
          // 检查并转换 events 数组中的日期
          if (parsed.events && Array.isArray(parsed.events)) {
            parsed.events = parsed.events.map((event) => {
              if (event.start) {
                event.start = new Date(event.start)
              }
              if (event.end) {
                event.end = new Date(event.end)
              }
              // 如果 date 属性也需要是 Date 对象，取消下面的注释
              // if (event.date) {
              //   event.date = new Date(event.date)
              // }
              return event
            })
          }
          return parsed
        },
      },
    },
  },
)
