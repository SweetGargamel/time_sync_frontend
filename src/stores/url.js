// 基础 URL 配置
// const base_url = 'http://47.122.85.137:5001'
const base_url = 'http://localhost:5001'

// 事件相关 URL
export const update_user_confirmed_events_url = `${base_url}/api/update_user_confirmed_events`

export const upload_LLM_events_url = `${base_url}/api/upload_LLM_events`
export const get_updating_events_url = `${base_url}/api/get_updating_events_url`
export const cancel_processing_url = `${base_url}/api/cancel_processing`

// 查询相关 URL
export const query_schedul_url = `${base_url}/api/query_schedule`

// 人员组相关 URL
export const get_person_list_url = `${base_url}/api/persons`
export const get_group_list_url = `${base_url}/api/groups`
export const add_group_url = `${base_url}/api/update_group`
export const add_persons_url = `${base_url}/api/update_persons`
//爬虫相关api
export const crawl_nju_class_url = `${base_url}/api/crawl_nju_class`

//文件相关url
export const upload_file_url = `${base_url}/api/upload_file`

//查看日程的url
export const view_events_url = `${base_url} /api/view_events`

//删除后端事件的url
export const delete_event_url = `${base_url}/api/delete_event`
