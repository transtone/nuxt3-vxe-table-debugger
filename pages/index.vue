<template>
  <div class="px-100px pt-20px">
    <vxe-grid-base ref="gridBase" :fixed-height="fixedHeight" :s-width="sWidth" :space-fix="spaceFix"
                   stripe resizable show-operation show-setting-box show-multi-del
                   :auto-resize="autoResize" :hide-pager="hidePager" :show-multi-btn="showMultiBtn"
                   :border="border" :header-filter="headerFilter"
                   :size="size" :operation-width="operationWidth" :cell-height="cellHeight" :show-sub="showSub"
                   :show-operation-set-button="showOperationSetButton"
                   :checkbox-enabled="checkboxEnabled" :check-one-row="checkOneRow" :check-by-row-click="checkByRowClick"
                   :keep-source="keepSource" :edit-config="editConfig" :data-loading="dataLoading"
                   :col-def="colDef" :row-data="rowData" @grid-events="handleGridEvents" @update-row-data="handleUpdateRowData">
      <template #operation="{ row, column }">
        <slot name="operation" :row="row" :column="column" />
      </template>
      <!-- 自定义多行操作按钮 -->
      <template #multi_action>
        <slot name="multi_action">
          <template v-if="showMultiDel && checkedRows.length>0">
            {{ checkedRows.length }}
            <!-- <el-badge :value="checkedRows.length" type="info">
              <el-button size="small" type="danger" plain @click="handleDelChecked">删除选中</el-button>
            </el-badge> -->
          </template>
        </slot>
      </template>
    </vxe-grid-base>
  </div>
</template>

<script setup>
const props = defineProps({
  showSettingBox: { type: Boolean, default: false },
  showImportBtn: { type: Boolean, default: false },
  fixedHeight: Number,
  cellHeight: { type: String, default: 'auto' },
  spaceFix: { type: Number, default: 62 },
  sWidth: { type: Number, default: 50 },
  operationWidth: { type: Number, default: 110 },
  autoResize: { type: Boolean, default: false },
  hidePager: { type: Boolean, default: false },
  showMultiBtn: { type: Boolean, default: false },
  showMultiDel: { type: Boolean, default: false },
  showOperation: { type: Boolean, default: false },
  showOperationSetButton: { type: Boolean, default: true },
  stripe: { type: Boolean, default: false },
  border: { type: Boolean, default: false },
  headerFilter: { type: Boolean, default: false },
  resizable: { type: Boolean, default: false },
  size: { type: String, default: 'small' },
  // seqFix: { type: Boolean, default: true },
  filterSettings: { type: Array, default() { return [] } },
  keepSource: { type: Boolean, default: true },
  showSub: { type: Boolean, default: true },
  checkboxEnabled: { type: Boolean, default: true },
  checkOneRow: { type: Boolean, default: false }, // 只选择一行
  checkByRowClick: { type: Boolean, default: false }, // 点击选中
  editConfig: {
    type: Object,
    default() {
      return { trigger: 'manual', mode: 'row', autoClear: false, showStatus: true }
    },
  },
  keyColumn: { type: String, default: 'id' },
  apiPath: String,
  apiMethod: String,
  extraFilter: { type: Object, default() { return {} } },
})

// 行数据
let rowData = $ref({
  dataList: [
    { id: 10001, name: 'Test1', nickname: 'T1', role: 'Develop', sex: 'Man', age: 28, address: 'Shenzhen' },
    { id: 10002, name: 'Test2', nickname: 'T2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
    { id: 10003, name: 'Test3', nickname: 'T3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
    { id: 10004, name: 'Test4', nickname: 'T4', role: 'Designer', sex: 'Women', age: 23, address: 'test abc' },
    { id: 10005, name: 'Test5', nickname: 'T5', role: 'Develop', sex: 'Women', age: 30, address: 'Shanghai' },
    { id: 10006, name: 'Test6', nickname: 'T6', role: 'Designer', sex: 'Women', age: 21, address: 'Shenzhen' },
    { id: 10007, name: 'Test7', nickname: 'T7', role: 'Test', sex: 'Man', age: 29, address: 'Shenzhen' },
    { id: 10008, name: 'Test8', nickname: 'T8', role: 'Develop', sex: 'Man', age: 35, address: 'test abc' },
    { id: 10009, name: 'Test9', nickname: 'T9', role: 'Develop', sex: 'Man', age: 35, address: 'Shenzhen' },
    { id: 100010, name: 'Test10', nickname: 'T10', role: 'Develop', sex: 'Man', age: 35, address: 'Guangzhou' },
  ], limit: 0, offset: 0, total: 0,
})
// 更新数据
const handleUpdateRowData = (data) => {
  let limit = data.limit
  let offset = data.offset
  let colFilter = data.colFilter
}
let dataLoading = $ref(false)
const handleGridEvents = (e) => {
  console.log(e)
}
// 模拟接口
const findList = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = [
        { id: 10001, name: 'Test1', nickname: 'T1', role: 'Develop', sex: 'Man', age: 28, address: 'Shenzhen' },
        { id: 10002, name: 'Test2', nickname: 'T2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
        { id: 10003, name: 'Test3', nickname: 'T3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
        { id: 10004, name: 'Test4', nickname: 'T4', role: 'Designer', sex: 'Women', age: 23, address: 'test abc' },
        { id: 10005, name: 'Test5', nickname: 'T5', role: 'Develop', sex: 'Women', age: 30, address: 'Shanghai' },
        { id: 10006, name: 'Test6', nickname: 'T6', role: 'Designer', sex: 'Women', age: 21, address: 'Shenzhen' },
        { id: 10007, name: 'Test7', nickname: 'T7', role: 'Test', sex: 'Man', age: 29, address: 'Shenzhen' },
        { id: 10008, name: 'Test8', nickname: 'T8', role: 'Develop', sex: 'Man', age: 35, address: 'test abc' },
        { id: 10009, name: 'Test9', nickname: 'T9', role: 'Develop', sex: 'Man', age: 35, address: 'Shenzhen' },
        { id: 100010, name: 'Test10', nickname: 'T10', role: 'Develop', sex: 'Man', age: 35, address: 'Guangzhou' },
      ]
      resolve(list)
    }, 100)
  })
}
const colDef = [
  { type: 'checkbox', width: 50 },
  { type: 'seq', width: 60 },
  { field: 'name', title: 'Name' },
  { field: 'nickname', title: 'Nickname' },
  { field: 'role', title: 'Role' },
  { field: 'address', title: 'Address', showOverflow: true },
]

const gridOptions = reactive({
  border: true,
  height: 400,
  columnConfig: {
    resizable: true,
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { type: 'seq', width: 60 },
    { field: 'name', title: 'Name' },
    { field: 'nickname', title: 'Nickname' },
    { field: 'role', title: 'Role' },
    { field: 'address', title: 'Address', showOverflow: true },
  ],
  proxyConfig: {
    ajax: {
      // 接收 Promise
      query: () => {
        return findList()
      },
    },
  },
})
</script>
