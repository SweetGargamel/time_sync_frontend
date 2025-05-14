import { ref } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useFilesStore = defineStore('files', () => {
  const fileList = ref([]) // { id: string, name: string, raw: File, status: 'ready' | 'uploading' | 'success' | 'error', progress: number, response: any, uid: string }

  const upload_user_file = ref([]) // { id: string, name: string, raw: File, status: 'ready' | 'uploading' | 'success' | 'error', progress: number, response: any, uid: string }
  const addFile = (file, fileList) => {
    const newFile = {
      id: uuidv4(),
      uid: uuidv4(), // el-upload uses uid for its internal list management
      name: file.name,
      raw: file,
      status: 'ready',
      progress: 0,
      response: null,
    }
    fileList.value.push(newFile)
    return newFile
  }

  const updateFileStatus = (uid, status, fileList, progress = null, response = null) => {
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

  const removeFileByUid = (uid, fileList) => {
    fileList.value = fileList.value.filter((f) => f.uid !== uid)
  }

  const getFileByUid = (uid, fileList) => {
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
