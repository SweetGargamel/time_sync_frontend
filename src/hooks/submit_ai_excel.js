import axios from 'axios'
import { ElMessage } from 'element-plus'
import { upload_file_url } from '../stores/url'

export async function uploadAiExcelFile(rawFile, fileId, fileName) {
  const formData = new FormData()
  formData.append('file', rawFile)
  formData.append('id', fileId)
  formData.append('file_name', fileName) // As per instruction to send file name

  try {
    const response = await axios.post(upload_file_url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data && response.data.code === 200 && response.data.id === fileId) {
      return { success: true, data: response.data }
    } else {
      ElMessage.error(
        `文件 ${fileName} 上传失败: ${response.data?.msg || '响应格式不正确或ID不匹配'}`,
      )
      return { success: false, error: response.data?.msg || '响应格式不正确或ID不匹配' }
    }
  } catch (error) {
    ElMessage.error(
      `文件 ${fileName} 上传出错: ${error.response?.data?.msg || error.message || '网络错误'}`,
    )
    console.error('Upload error in uploadAiExcelFile:', error)
    return { success: false, error: error.response?.data?.msg || error.message || '网络错误' }
  }
}
