import { ref, reactive } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import axios from 'axios'
import { crawl_nju_class_url } from '../stores/url' // Assuming stores/url.js exports this

export function useNjuCrawler(personList) {
  const njuAuthDialogVisible = ref(false)
  const NJUClassForm = reactive({
    user_name: '',
    password: '',
    selectedPerson: '',
  })

  const njuAuthRules = {
    selectedPerson: [{ required: true, message: '请选择人员', trigger: 'change' }],
    user_name: [
      { required: true, message: '请输入学号', trigger: 'blur' },
      { pattern: /^\d{9}$/, message: '学号必须为9位数字', trigger: 'blur' },
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  }

  const njuAuthFormRef = ref(null)

  const handlePersonSelect = (value) => {
    const selectedPersonData = personList.value.find((person) => person.id === value)
    if (selectedPersonData) {
      NJUClassForm.user_name = selectedPersonData.id
    }
  }

  const showNJUAuthDialog = () => {
    njuAuthDialogVisible.value = true
    NJUClassForm.selectedPerson = ''
    NJUClassForm.user_name = ''
    NJUClassForm.password = ''
    if (njuAuthFormRef.value) {
      // 使用 nextTick 确保 DOM 更新后再调用 resetFields
      // import { nextTick } from 'vue'
      // nextTick(() => {
      //   njuAuthFormRef.value.resetFields();
      // });
      // 或者在对话框组件上监听 opened 事件来重置
    }
  }

  const handleNJUAuthSubmit = async () => {
    if (!njuAuthFormRef.value) return

    await njuAuthFormRef.value.validate(async (valid) => {
      if (!valid) return

      const loading = ElLoading.service({
        lock: true,
        text: '正在向后台导入课表信息...',
        background: 'rgba(0, 0, 0, 0.7)',
      })

      try {
        const response = await axios.post(crawl_nju_class_url, {
          id: NJUClassForm.user_name,
          password: NJUClassForm.password,
        })

        if (response.data.code === 200) {
          ElMessage.success(response.data.msg || '导入课表成功')
          njuAuthDialogVisible.value = false
        } else if (response.data.code === 401) {
          ElMessage.error(response.data.msg || '账号或密码错误')
        } else if (response.data.code === 403) {
          ElMessage.error(response.data.msg || '课表爬虫失效')
        } else {
          ElMessage.error(response.data.msg || '其他未知错误')
        }
      } catch (error) {
        console.error('NJU auth request failed:', error)
        ElMessage.error('请求失败，请检查网络或联系管理员')
      } finally {
        loading.close()
        if (!njuAuthDialogVisible.value) {
          // if dialog was closed (on success)
          NJUClassForm.user_name = ''
          NJUClassForm.password = ''
          NJUClassForm.selectedPerson = ''
          if (njuAuthFormRef.value) {
            njuAuthFormRef.value.resetFields() // Reset validation state as well
          }
        }
      }
    })
  }

  return {
    njuAuthDialogVisible,
    NJUClassForm,
    njuAuthRules,
    njuAuthFormRef,
    handlePersonSelect,
    showNJUAuthDialog,
    handleNJUAuthSubmit,
  }
}
