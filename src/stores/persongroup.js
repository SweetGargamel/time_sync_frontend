//这个是用来处理人员信息和上传、修改人员信息的页面的pinia

import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { get_person_list_url, get_group_list_url, add_group_url, add_persons_url } from './url'

export const usePersonGroupStore = defineStore(
  'personGroup',
  () => {
    // 状态
    const person_list = ref([])
    const group_list = ref([])
    const loading = ref(false)
    const error = ref(null)

    // 获取人员列表的异步函数
    async function query_person_list() {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get(get_person_list_url, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // 更新人员列表
        person_list.value = response.data.persons
        return response.data.persons
      } catch (error) {
        console.error('获取人员列表失败:', error)
        error.value = error.message
        throw error
      } finally {
        loading.value = false
      }
    }

    // 获取组列表的异步函数
    async function query_group_list() {
      loading.value = true
      error.value = null
      try {
        const response = await axios.get(get_group_list_url, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        // 更新组列表
        group_list.value = response.data.groups
        return response.data.groups
      } catch (error) {
        console.error('获取组列表失败:', error)
        error.value = error.message
        throw error
      } finally {
        loading.value = false
      }
    }

    // 管理人员信息的异步函数
    async function manage_persons(changed_persons) {
      loading.value = true
      console.log('changed', changed_persons)
      try {
        const response = await axios.post(
          add_persons_url,
          {
            persons: changed_persons,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        return response.data
      } catch (error) {
        console.error('管理人员信息失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }

    // 管理组信息的异步函数
    async function manage_groups(changed_groups) {
      loading.value = true
      try {
        const response = await axios.post(
          add_group_url,
          {
            groups: changed_groups,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        return response.data
      } catch (error) {
        console.error('管理组信息失败:', error)
        throw error
      } finally {
        loading.value = false
      }
    }

    // 返回所有状态和方法
    return {
      // 状态
      person_list,
      group_list,
      loading,
      error,

      // 方法
      query_person_list,
      query_group_list,
      manage_persons,
      manage_groups,
    }
  },
  {
    persist: true,
  },
)
