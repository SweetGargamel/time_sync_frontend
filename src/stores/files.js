import { ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useFilesStore = defineStore('files', () => {
  const fileList = ref([]) // { id: string, name: string, raw: File, status: 'ready' | 'uploading' | 'success' | 'error', progress: number, response: any, uid: string }

  const upload_user_file = ref([]) // { id: string, name: string, raw: File, status: 'ready' | 'uploading' | 'success' | 'error', progress: number, response: any, uid: string }
  const addFile = (file) => {
    const fileId = uuidv4()
    const fileUid = uuidv4() // el-upload uses uid for its internal list management
    const newFile = {
      id: fileId,
      uid: fileUid,
      name: file.name,
      raw: file,
      status: 'ready',
      progress: 0,
      response: null,
    }
    fileList.value.push(newFile)
    return newFile
  }

  const updateFileStatus = (uid, status, progress = null, response = null) => {
    const fileToUpdate = fileList.value.find((f) => f.uid === uid)
    if (fileToUpdate) {
      fileToUpdate.status = status
      if (progress !== null) {
        fileToUpdate.progress = progress
      }
      if (response !== null) {
        fileToUpdate.response = response
      }
    }
  }

  const removeFileByUid = (uid) => {
    fileList.value = fileList.value.filter((f) => f.uid !== uid)
  }

  const getFileByUid = (uid) => {
    return fileList.value.find((f) => f.uid === uid)
  }

  return {
    fileList,
    addFile,
    updateFileStatus,
    removeFileByUid,
    getFileByUid,
    upload_user_file,
  }
})
