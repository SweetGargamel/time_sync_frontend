import { LLM_form_group_url } from '../stores/url'

export const useLLMFormGroup = () => {
  const sendLLMFormGroupRequest = async (userNeed) => {
    try {
      const response = await fetch(LLM_form_group_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_need: userNeed,
        }),
      })
      const data = await response.json()
      console.log('AI选人请求成功:', data)
      return data
    } catch (error) {
      console.error('AI选人请求失败:', error)
      throw error
    }
  }

  return {
    sendLLMFormGroupRequest,
  }
}
