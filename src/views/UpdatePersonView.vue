<template>
    <div class="container">
        <h2>人员信息管理</h2>
        <!-- 切换按钮 -->
        <div class="switch-buttons">
            <el-button :type="activeTable === 'person' ? 'primary' : 'default'" @click="activeTable = 'person'">
                查看人员信息
            </el-button>
            <el-button :type="activeTable === 'group' ? 'primary' : 'default'" @click="activeTable = 'group'">
                查看组信息
            </el-button>
        </div>

        <!-- 人员表格 -->
        <el-text class="warning-text" type="warning">
            <el-icon class="warning-icon">
                <Warning />
            </el-icon>
            等待修改结果返回时请不要刷新页面
        </el-text>
        <el-table v-if="activeTable === 'person'" :data="pagedPersonList" border style="width: 100%; margin-top: 20px;"
            table-layout="auto">
            <el-table-column prop="id" label="ID" width="180" :resizable="false" />
            <el-table-column prop="name" label="姓名" width="180" :resizable="false" />
            <el-table-column label="所属组" min-width="300" :resizable="false">
                <template #default="scope">
                    <el-tag v-for="grouid in scope.row.belong_group" :key="grouid" class="nju-purple"
                        style="margin-right: 5px; margin-bottom: 5px;">
                        {{groupList.find(g => g.id === grouid)?.gname || grouid}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" :resizable="false">
                <template #default="scope">
                    <el-button size="small" type="primary" @click="handleEditPerson(scope.$index, scope.row)">
                        修改
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDeletePerson(scope.$index, scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="activeTable === 'person'" v-model:current-page="currentPagePerson"
            v-model:page-size="pageSizePerson" :page-sizes="[15, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper" :total="personList.length"
            @size-change="handleSizeChangePerson" @current-change="handleCurrentChangePerson"
            style="margin-top: 20px; justify-content: flex-end;" />

        <!-- 编辑人员弹窗 -->
        <el-dialog v-model="editDialogVisible" title="编辑人员信息" width="400px">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
                <el-form-item label="学号" prop="id">
                    <el-input v-model="editForm.id" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name" />
                </el-form-item>
                <el-form-item label="所属组" prop="belong_group">
                    <el-select class="purple-select" v-model="editForm.belong_group" multiple filterable
                        placeholder="请选择组" style="width: 100%">
                        <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="handleEditPersonCancel">取消</el-button>
                <el-button type="primary" @click="handleEditPersonConfirm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 组表格 -->
        <el-table v-if="activeTable === 'group'" :data="pagedGroupList" border style="width: 100%; margin-top: 20px;"
            table-layout="auto">
            <el-table-column prop="id" label="ID" width="180" :resizable="false" />
            <el-table-column prop="gname" label="组名" width="180" :resizable="false" />
            <el-table-column label="包含人员" min-width="300" :resizable="false">
                <template #default="scope">
                    <el-tag v-for="personId in scope.row.gperson" :key="personId" class="nju-purple"
                        style="margin-right: 5px; margin-bottom: 5px;">
                        {{personList.find(p => p.id === personId)?.name || personId}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right" :resizable="false">
                <template #default="scope">
                    <el-button size="small" type="primary" @click="handleEditGroup(scope.$index, scope.row)">
                        修改
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDeleteGroup(scope.$index, scope.row)">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-if="activeTable === 'group'" v-model:current-page="currentPageGroup"
            v-model:page-size="pageSizeGroup" :page-sizes="[1, 2, 3, 5]"
            layout="total, sizes, prev, pager, next, jumper" :total="groupList.length"
            @size-change="handleSizeChangeGroup" @current-change="handleCurrentChangeGroup"
            style="margin-top: 20px; justify-content: flex-end;" />

        <!-- 编辑组弹窗 -->
        <el-dialog v-model="editGroupDialogVisible" title="编辑组信息" width="400px">
            <el-form :model="editGroupForm" :rules="editGroupFormRules" ref="editGroupFormRef" label-width="80px">
                <el-form-item label="组名" prop="name">
                    <el-input v-model="editGroupForm.name" />
                </el-form-item>
                <el-form-item label="组成员" prop="persons">
                    <el-select class="purple-select" v-model="editGroupForm.persons" multiple filterable
                        placeholder="请选择组成员" style="width: 100%">
                        <el-option v-for="person in personList" :key="person.id" :label="person.name"
                            :value="person.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="handleEditGroupCancel">取消</el-button>
                <el-button type="primary" @click="handleEditGroupConfirm">确定</el-button>
            </template>
        </el-dialog>

        <div class="add-buttons" style="margin: 20px 0;">
            <el-button v-if="activeTable === 'person'" type="primary" @click="handleAddPerson">新增人员</el-button>
            <el-button v-if="activeTable === 'group'" type="primary" @click="handleAddGroup">新增组</el-button>
        </div>

        <!-- 新增人员弹窗 -->
        <el-dialog v-model="addPersonDialogVisible" title="新增人员" width="400px">
            <el-form :model="addPersonForm" :rules="addPersonFormRules" ref="addPersonFormRef" label-width="80px">
                <el-form-item label="学号" prop="id">
                    <el-input v-model="addPersonForm.id" />
                </el-form-item>
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="addPersonForm.name" />
                </el-form-item>
                <el-form-item label="所属组" prop="belong_group">
                    <el-select class="purple-select" v-model="addPersonForm.belong_group" multiple filterable
                        placeholder="请选择组" style="width: 100%">
                        <el-option v-for="group in groupList" :key="group.id" :label="group.gname" :value="group.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="handleAddPersonCancel">取消</el-button>
                <el-button type="primary" @click="handleAddPersonConfirm">确定</el-button>
            </template>
        </el-dialog>

        <!-- 新增组弹窗 -->
        <el-dialog v-model="addGroupDialogVisible" title="新增组" width="400px">
            <el-form :model="addGroupForm" :rules="addGroupFormRules" ref="addGroupFormRef" label-width="80px">
                <el-form-item label="组名" prop="name">
                    <el-input v-model="addGroupForm.name" />
                </el-form-item>
                <el-form-item label="组成员" prop="persons">
                    <el-select class="purple-select" v-model="addGroupForm.persons" multiple filterable
                        placeholder="请选择组成员" style="width: 100%">
                        <el-option v-for="person in personList" :key="person.id" :label="person.name"
                            :value="person.id" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="handleAddGroupCancel">取消</el-button>
                <el-button type="primary" @click="handleAddGroupConfirm">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { usePersonGroupStore } from '../stores/persongroup'
import { ElMessage, ElLoading } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

const store = usePersonGroupStore()
const activeTable = ref('person') // 默认显示人员表格

// 分页相关 - 人员
const currentPagePerson = ref(1)
const pageSizePerson = ref(15)

// 分页相关 - 组
const currentPageGroup = ref(1)
const pageSizeGroup = ref(1)

// 新增：自定义校验学号是否重复
const validatePersonId = (rule, value, callback) => {
    if (value && personList.value.some(person => person.id === value)) {
        callback(new Error('学号已存在，请使用其他学号'))
    } else {
        callback()
    }
}

// 计算属性
const personList = computed(() => store.person_list)
const groupList = computed(() => store.group_list)

// 计算属性 - 分页后的人员列表
const pagedPersonList = computed(() => {
    const start = (currentPagePerson.value - 1) * pageSizePerson.value
    const end = start + pageSizePerson.value
    return personList.value.slice(start, end)
})

// 计算属性 - 分页后的组列表
const pagedGroupList = computed(() => {
    const start = (currentPageGroup.value - 1) * pageSizeGroup.value
    const end = start + pageSizeGroup.value
    return groupList.value.slice(start, end)
})

// 编辑弹窗相关
const editDialogVisible = ref(false)
const editForm = reactive({
    id: '',
    name: '',
    belong_group: []
})
const editFormRules = {
    id: [
        { required: true, message: '学号不能为空', trigger: 'blur' },
        { pattern: /^\d{9}$/, message: '学号必须为9位数字', trigger: 'blur' }
    ],
    name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
}
const editFormRef = ref()

// 编辑组弹窗相关
const editGroupDialogVisible = ref(false)
const editGroupForm = reactive({
    id: '',
    name: '',
    persons: []
})
const editGroupFormRules = {
    name: [{ required: true, message: '组名不能为空', trigger: 'blur' }],
    persons: [{ required: true, message: '请选择组成员', trigger: 'change' }]
}
const editGroupFormRef = ref()

// 新增人员弹窗
const addPersonDialogVisible = ref(false)
const addPersonForm = reactive({
    id: '',
    name: '',
    belong_group: []
})
const addPersonFormRules = {
    id: [
        { required: true, message: '学号不能为空', trigger: 'blur' },
        { pattern: /^\d{9}$/, message: '学号必须为9位数字', trigger: 'blur' },
        { validator: validatePersonId, trigger: 'blur' }
    ],
    name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }]
}
const addPersonFormRef = ref()

// 新增组弹窗
const addGroupDialogVisible = ref(false)
const addGroupForm = reactive({
    name: '',
    persons: []
})
const addGroupFormRules = {
    name: [{ required: true, message: '组名不能为空', trigger: 'blur' }],
    persons: [{ required: true, message: '请选择组成员', trigger: 'change' }]
}
const addGroupFormRef = ref()

// 人员相关方法
const handleEditPerson = (index, row) => {
    editForm.id = row.id
    editForm.name = row.name
    editForm.belong_group = Array.isArray(row.belong_group) ? [...row.belong_group] : []
    editDialogVisible.value = true
    if (editFormRef.value) {
        editFormRef.value.clearValidate();
    }
}

const handleEditPersonConfirm = async () => {
    await editFormRef.value.validate(async (valid) => {
        if (!valid) return
        // 开启 loading
        const loadingInstance = ElLoading.service({
            lock: true,
            text: '正在保存，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
            const response = await store.manage_persons([
                {
                    id: editForm.id,
                    name: editForm.name,
                    belong_group: editForm.belong_group,
                    opt_type: 'update'
                }
            ])

            if (response.code === 200) {
                ElMessage.success('修改成功')
            } else {
                ElMessage.error(response.msg)
            }
            await Promise.all([
                store.query_person_list(),
                store.query_group_list()
            ])
        } catch (e) {
            ElMessage.error('修改失败')
        } finally {
            loadingInstance.close()
            editDialogVisible.value = false
        }
    })
}

const handleEditPersonCancel = () => {
    editDialogVisible.value = false
}

// 组相关方法
const handleEditGroup = (index, row) => {
    editGroupForm.id = row.id
    editGroupForm.name = row.gname
    editGroupForm.persons = Array.isArray(row.gperson) ? [...row.gperson] : []
    editGroupDialogVisible.value = true
}

const handleEditGroupConfirm = async () => {
    await editGroupFormRef.value.validate(async (valid) => {
        if (!valid) return
        const loadingInstance = ElLoading.service({
            lock: true,
            text: '正在保存，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
            const response = await store.manage_groups([
                {
                    id: editGroupForm.id,
                    name: editGroupForm.name,
                    persons: editGroupForm.persons,
                    opt_type: 'update'
                }
            ])
            if (response.code === 200) {
                ElMessage.success('修改成功')
            } else {
                ElMessage.error(response.msg)
            }
            await Promise.all([
                store.query_group_list(),
                store.query_person_list()
            ])
        } catch (e) {
            ElMessage.error('修改失败')
        } finally {
            loadingInstance.close()
            editGroupDialogVisible.value = false

        }
    })
}

const handleEditGroupCancel = () => {
    editGroupDialogVisible.value = false
}

const handleDeletePerson = async (index, row) => {
    // 开启 loading
    const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在删除，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
        const response = await store.manage_persons([
            {
                id: row.id,
                name: row.name,
                belong_group: Array.isArray(row.belong_group) ? row.belong_group : [],
                opt_type: 'delete'
            }
        ])
        if (response.code === 200) {
            ElMessage.success('删除成功')
        } else {
            ElMessage.error(response.msg)
        }
        await Promise.all([
            store.query_person_list(),
            store.query_group_list()
        ])
    } catch (e) {
        ElMessage.error('删除失败')
    } finally {
        loadingInstance.close()
    }
}

const handleDeleteGroup = async (index, row) => {
    const loadingInstance = ElLoading.service({
        lock: true,
        text: '正在删除，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    })
    try {
        const response = await store.manage_groups([
            {
                id: row.id,
                name: row.gname,
                persons: Array.isArray(row.gperson) ? row.gperson : [],
                opt_type: 'delete'
            }
        ])
        if (response.code === 200) {
            ElMessage.success('删除成功')
        } else {
            ElMessage.error(response.msg)
        }
        await Promise.all([
            store.query_group_list(),
            store.query_person_list()
        ])
    } catch (e) {
        ElMessage.error('删除失败')
    } finally {
        loadingInstance.close()
    }
}

const handleAddPerson = () => {
    addPersonForm.id = ''
    addPersonForm.name = ''
    addPersonForm.belong_group = []
    addPersonDialogVisible.value = true
    // if (addPersonFormRef.value) {
    //     console.log('resetFields');
    //     console.log(addPersonFormRef.value);
    //     addPersonFormRef.value.resetFields(['id', 'name']);
    // }
}

const handleAddGroup = () => {
    addGroupForm.name = ''
    addGroupForm.persons = []
    addGroupDialogVisible.value = true
}

const handleAddPersonConfirm = async () => {
    await addPersonFormRef.value.validate(async (valid) => {
        if (!valid) return
        const loadingInstance = ElLoading.service({
            lock: true,
            text: '正在添加，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
            const response = await store.manage_persons([
                {
                    id: addPersonForm.id,
                    name: addPersonForm.name,
                    belong_group: addPersonForm.belong_group || [],
                    opt_type: 'create'
                }
            ])
            console.log("111111111", addPersonForm.id);
            if (response.code === 200) {
                ElMessage.success('添加成功')
            } else {
                ElMessage.error("添加失败")
            }
            await Promise.all([
                store.query_person_list(),
                store.query_group_list()
            ])
        } catch (e) {
            ElMessage.error('添加失败')
        } finally {
            loadingInstance.close()
            addPersonDialogVisible.value = false
        }
    })
}

const handleAddPersonCancel = () => {
    addPersonDialogVisible.value = false
}

const handleAddGroupConfirm = async () => {
    await addGroupFormRef.value.validate(async (valid) => {
        if (!valid) return
        const loadingInstance = ElLoading.service({
            lock: true,
            text: '正在添加，请稍候...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
        try {
            const response = await store.manage_groups([
                {
                    id: uuidv4(),
                    name: addGroupForm.name,
                    persons: addGroupForm.persons,
                    opt_type: 'create'
                }
            ])
            if (response.code === 200) {
                ElMessage.success('添加成功')
            } else {
                ElMessage.error(response.msg)
            }
            await Promise.all([
                store.query_group_list(),
                store.query_person_list()
            ])
        } catch (e) {
            ElMessage.error('添加失败')
        } finally {
            loadingInstance.close()
            addGroupDialogVisible.value = false
        }
    })
}

const handleAddGroupCancel = () => {
    addGroupDialogVisible.value = false
}

// 分页处理函数 - 人员
const handleSizeChangePerson = (val) => {
    pageSizePerson.value = val
    currentPagePerson.value = 1 // 切换每页数量时，重置到第一页
}
const handleCurrentChangePerson = (val) => {
    currentPagePerson.value = val
}

// 分页处理函数 - 组
const handleSizeChangeGroup = (val) => {
    pageSizeGroup.value = val
    currentPageGroup.value = 1 // 切换每页数量时，重置到第一页
}
const handleCurrentChangeGroup = (val) => {
    currentPageGroup.value = val
}

// 组件挂载时获取数据
onMounted(async () => {
    try {
        await Promise.all([
            store.query_person_list(),
            store.query_group_list(),
        ])
        console.log('group_list', store.group_list)
        console.log('person_list', store.person_list)

    } catch (error) {
        ElMessage.error('获取数据失败')
    }
})
</script>

<style scoped>
.container {
    padding: 20px;
    padding-right: 100px;
    /* background: #f7f9fb; */
    min-height: 100vh;
    max-width: 1600px;
    margin: 0 auto;
}

.switch-buttons {
    margin-bottom: 20px;
}

.switch-buttons .el-button {
    margin-right: 10px;
}

.add-buttons {
    margin: 20px 0;
}

:deep(.el-table) {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-fill-color-light);
}

:deep(.el-table th) {
    background-color: var(--el-table-header-bg-color);
    color: var(--el-text-color-primary);
    font-weight: 600;
    font-size: 14px;
    padding: 12px 0;
}

:deep(.el-table td) {
    padding: 12px 0;
}

:deep(.el-tag) {
    margin: 4px;
}

:deep(.el-table__fixed-right) {
    height: 100% !important;
}

:deep(.el-table__fixed-right::before) {
    background-color: var(--el-table-border-color);
}

/* 紫色主题按钮，覆盖 Element Plus primary 按钮颜色 */
:deep(.el-button--primary) {
    background-color: #824082 !important;
    border-color: #824082 !important;
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
    background-color: #a05ca0 !important;
    border-color: #a05ca0 !important;
}

/* 修复未选中按钮悬浮时仍为蓝色的问题 */
:deep(.el-button--default:hover),
:deep(.el-button--default:focus) {
    background-color: #f3e6f7 !important;
    color: #824082 !important;
    border-color: #824082 !important;
}

/* 紫色标签样式 */
:deep(.el-tag.nju-purple) {
    background-color: #f3e6f7 !important;
    color: #824082 !important;
    border-color: #824082 !important;
}

/* 分页组件激活状态颜色 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
    background-color: #824082 !important;
    /* 背景色 */
    color: var(--el-color-white) !important;
    /* 文字颜色 */
}

/* 分页组件按钮悬浮颜色 */
:deep(.el-pagination.is-background .el-pager li:hover) {
    color: #824082 !important;
    /* 文字颜色 */
}

/* 分页组件按钮默认颜色 */
:deep(.el-pagination.is-background .btn-prev:not(:disabled):hover),
:deep(.el-pagination.is-background .btn-next:not(:disabled):hover) {
    color: #824082 !important;
}
</style>