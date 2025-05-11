import axios from 'axios'
import { ElMessage } from 'element-plus'
import { upload_file_url } from '../stores/url' // 确保路径正确

export function useFileUploader() {
  const uploadFile = async (fileStoreItem, filesStoreInstance) => {
    if (!fileStoreItem || !fileStoreItem.raw) {
      ElMessage.error('无效的文件对象')
      return
    }

    const formData = new FormData()
    formData.append('file', fileStoreItem.raw)
    formData.append('id', fileStoreItem.id) // 后端需要id
    // formData.append('file_name', fileStoreItem.name) // 后端需要file_name

    try {
      filesStoreInstance.updateFileStatus(fileStoreItem.uid, 'uploading')
      const response = await axios.post(upload_file_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          filesStoreInstance.updateFileStatus(fileStoreItem.uid, 'uploading', percentCompleted)
        },
      })

      if (response.data && response.data.code === 200) {
        filesStoreInstance.updateFileStatus(fileStoreItem.uid, 'success', 100, response.data)
        ElMessage.success(`${fileStoreItem.name} 上传成功: ${response.data.msg}`)
      } else {
        filesStoreInstance.updateFileStatus(
          fileStoreItem.uid,
          'error',
          fileStoreItem.progress,
          response.data,
        )
        ElMessage.error(`${fileStoreItem.name} 上传失败: ${response.data.msg || '未知错误'}`)
      }
    } catch (error) {
      filesStoreInstance.updateFileStatus(
        fileStoreItem.uid,
        'error',
        fileStoreItem.progress,
        error.response?.data || error.message,
      )
      ElMessage.error(
        `${fileStoreItem.name} 上传出错: ${error.response?.data?.msg || error.message || '网络错误'}`,
      )
      console.error('Upload error:', error)
    }
  }

  return {
    uploadFile,
  }
}
