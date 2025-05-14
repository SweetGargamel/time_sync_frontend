import axios from 'axios'
import { ElMessage } from 'element-plus'
import { LLM_AI_insert_person_url } from '../stores/url' // 确保路径正确

export async function triggerAIInsertPerson(fileId) {
  try {
    const response = await axios.post(LLM_AI_insert_person_url, {
      file_id: fileId,
    })

    if (response.data && response.data.code === 200) {
      return { success: true, data: response.data }
    } else {
      ElMessage.error(`AI处理失败: ${response.data?.msg || '未知错误'}`)
      return { success: false, error: response.data?.msg || '未知错误' }
    }
  } catch (error) {
    ElMessage.error(`AI处理请求出错: ${error.response?.data?.msg || error.message || '网络错误'}`)
    console.error('AI Insert Person error:', error)
    return { success: false, error: error.response?.data?.msg || error.message || '网络错误' }
  }
}
