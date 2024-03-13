<template>
  <div ref="vxeGridComponet" class="vxe-cust relative bg-white text-12px">
    <vxe-grid ref="xGrid" :class="{ 'border-1': border }" v-bind="gridOptions" v-on="gridEvents"
              @edit-activated="handleEditActived" @edit-closed="handleEditClosed">
      <!-- 序号及行选择 -->
      <template v-if="checkboxEnabled" #checkbox="{ row, rowIndex, checked, disabled, indeterminate }">
        <div class="col--checkbox col--checkbox-linenumber flex items-center justify-center" @click="handleCheckboxChange(row)">
          <span class="vxe-cell--checkbox"
                :class="{ 'is--checked': checked, 'is--indeterminate': indeterminate, 'is--disabled': disabled }">
            <template v-if="showSub">
              <span v-if="checked" class="vxe-checkbox--icon vxe-checkbox--checked-icon" />
              <span v-else-if="indeterminate" class="vxe-checkbox--icon vxe-checkbox--indeterminate-icon" />
              <span v-else-if="disabled" class="vxe-checkbox--icon vxe-checkbox--unchecked-icon" />
              <template v-else>
                <span class="vxe-checkbox--icon vxe-checkbox--unchecked-icon" />
                <span class="vxe-checkbox--label">
                  {{ rowIndex + offsetShow + 1 }}
                </span>
              </template>
            </template>
            <template v-else>
              <span v-if="checked&&!row.mid" class="vxe-checkbox--icon vxe-checkbox--checked-icon" />
              <span v-else-if="indeterminate&&!row.mid" class="vxe-checkbox--icon vxe-checkbox--indeterminate-icon" />
              <span v-else-if="disabled&&!row.mid" class="vxe-checkbox--icon vxe-checkbox--unchecked-icon" />
              <template v-else>
                <span v-if="!row.mid" class="vxe-checkbox--icon vxe-checkbox--unchecked-icon" />
                <span v-if="!row.mid" class="vxe-checkbox--label">
                  {{ rowIndex + offsetShow + 1 }}
                </span>
              </template>

            </template>
          </span>
        </div>
      </template>

      <!-- 自定义带搜索栏的表头 -->
      <template #search_header="{ row, column }">
        <div :class="{ 'pb-6px': headerFilter }" class="leading-1em space-x-3px">
          <span class="cursor-pointer" @click="handleHeaderSort(column)">
            {{ column.params.alias ? column.params.alias : column.params.fieldName }}
          </span>
          <template v-if="!column.params.readonly">
            <i class="text-hex-666" i-ant-design-edit-outlined />
          </template>
          <i i-bi-sort-down class="text-hex-999 !text-12px !font-500"
             :class="{ '!text-blue': fnIsMainOrder(column), 'hidden': fnOrderIconHide('-', column) }" />
          <i i-bi-sort-up class="text-hex-999 !text-12px !font-500"
             :class="{ '!text-blue': fnIsMainOrder(column), 'hidden': fnOrderIconHide('+', column) }" />
        </div>
      </template>

      <template #render_link="{ row, column }">
        <span class="inline-block cursor-pointer text-hex-4472c4 hover:underline">
          {{ row[column.params.fieldName] }}
        </span>
      </template>

      <template v-if="showOperation" #operation="{ row, column }">
        <slot name="operation" :row="row" :column="column" />
      </template>

    </vxe-grid>
    <!-- 分页器 -->
    <div v-if="!hidePager" class="h-45px flex items-center justify-between"
         :class="{ 'border-base border border-t-0  rounded-b-2px pr-8px': border }">
      <div class="multi_action min-w-100px">
        <slot name="multi_action" />
      </div>
      <el-pagination class="ant-row" show-size-changer size="small" :total="total*1" :page-size="pageSize"
                     :page-size-options="pageSizeOptsShow" :show-total="total => ` 共 ${total} 条`"
                     @change="handlePageChange"
                     @show-size-change="handlePageSizeChange">
        <template #buildOptionText="pages">
          <span v-if="pages.value !== total.toString()">{{ pages.value }}条/页</span>
          <span v-else>全部</span>
        </template>
      </el-pagination>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hideCols: { type: Object, default() { return {} } },
  checkboxEnabled: { type: Boolean, default: true },
  checkOneRow: { type: Boolean, default: false }, // 只选择一行
  checkByRowClick: { type: Boolean, default: false }, // 点击选中
  fixedHeight: Number,
  cellHeight: { type: String, default: 'auto' },
  sWidth: { type: Number, default: 50 },
  spaceFix: { type: Number, default: 80 },
  operationWidth: { type: Number, default: 110 },
  autoResize: { type: Boolean, default: false },
  hidePager: { type: Boolean, default: false },
  showMultiBtn: { type: Boolean, default: false },
  showMultiDel: { type: Boolean, default: false },
  showOperation: { type: Boolean, default: false },
  showOperationSetButton: { type: Boolean, default: false },
  stripe: { type: Boolean, default: false },
  border: { type: Boolean, default: false },
  resizable: { type: Boolean, default: false },
  size: { type: String, default: 'small' },
  keepSource: { type: Boolean, default: false },
  showSub: { type: Boolean, default: true },
  editConfig: {
    type: Object,
    default() {
      return { trigger: 'manual', mode: 'row', autoClear: false, showStatus: true }
    },
  },
  treeConfig: { type: Object },
  colDef: { type: Array, default() { return [] } },
  rowData: {
    type: Object,
    default() {
      return { dataList: [], limit: 0, offset: 10, total: 0 }
    },
  },
  dataLoading: { type: Boolean, default: false },
  tableExpand: { type: Function, default() { return {} } },
  emitScrollEvent: { type: Boolean, default: false },
})
const emit = defineEmits(['update-row-data', 'form-cell-clicked', 'grid-events'])

const vxeGridComponet = ref(null)

let xGrid = $ref()
const { height: clientHeight } = useWindowSize()
const { top } = useElementBounding($$(xGrid))

// 表格事件
const gridEvents = {
  headerCellClick(params) {
    emit('grid-events', { event: 'headerCellClick', params, name: '表头单元格点击' })
  },
  headerCellDblclick(params) {
    emit('grid-events', { event: 'headerCellDblclick', params, name: '表头单元格双击' })
  },
  headerCellMenu(params) {
    emit('grid-events', { event: 'headerCellMenu', params, name: '表头右键单元格' })
  },
  cellClick(params) {
    emit('grid-events', { event: 'cellClick', params, name: '单元格点击' })
    if (props.checkByRowClick) { // 点击选中
      handleCheckboxChange(params.row)
    }
  },
  cellDblclick(params) {
    emit('grid-events', { event: 'cellDblclick', params, name: '单元格双击' })
  },
  cellMenu(params) {
    emit('grid-events', { event: 'cellMenu', params, name: '单元格右键行' })
  },
  footerCellClick(params) {
    emit('grid-events', { event: 'footerCellClick', params, name: '表尾单元格点击' })
  },
  footerCellDblclick(params) {
    emit('grid-events', { event: 'footerCellDblclick', params, name: '表尾单元格双击' })
  },
  footerCellMenu(params) {
    emit('grid-events', { event: 'footerCellMenu', params, name: '表尾右键单元格' })
  },
  checkboxChange(params) {
    emit('grid-events', { event: 'checkboxChange', params, name: '复选框切换' })
  },
  checkboxAll(params) {
    emit('grid-events', { event: 'checkboxAll', params, name: '复选框全选切换' })
  },
  scroll(params) {
    if (props.emitScrollEvent) {
      emit('grid-events', { event: 'scroll', params, name: '滚动事件' })
    }
  },
  zoom(params) {
    emit('grid-events', { event: 'zoom', params, name: '表格全屏' })
  },
  custom(params) {
    emit('grid-events', { event: 'custom', params, name: '表格自定义列表' })
  },
}
const showSettings = () => {
  emit('grid-events', { event: 'showSettings', name: '表头设置' })
}

let tableParams = $ref({})
const fnIsMainOrder = item => {
  if (isNilOrEmpty(tableParams['@order'])) {
    return false
  }
  return tableParams['@order'].indexOf(item.params.fieldName) === 0
}
const fnOrderIconHide = (sortType, item) => {
  if (isNilOrEmpty(tableParams['@order']) || !tableParams['@order'].includes(item.params.fieldName)) {
    return true
  }
  const orders = tableParams['@order'].split(',')
  const orderItem = orders.find(e => e.includes(item.params.fieldName))
  return !(isNotNilOrEmpty(orderItem) && orderItem.includes(sortType))
}
const handleHeaderSort = item => {
  if (isNilOrEmpty(tableParams['@order'])) {
    tableParams['@order'] = `${item.params.fieldName}-`
  } else {
    const orders = tableParams['@order'].split(',')
    const orderIdx = orders.findIndex(e => e.includes(item.params.fieldName))
    if (orderIdx === -1) {
    // 为空，添加降序
      orders.unshift(`${item.params.fieldName}-`)
    } else if (orders[orderIdx].includes('-')) {
    // 降序，变为升序
      orders.splice(orderIdx, 1)
      orders.unshift(`${item.params.fieldName}+`)
    } else {
    // 升序，设置为空
      orders.splice(orderIdx, 1)
    }
    tableParams['@order'] = orders.join(',')
  }
  fnLoadData()
}

let pageSize = $ref(50)

const pageSizeOpts = ['50', '100', '500', '2000']

const pageSizeOptsShow = $computed(() => {
  if (total < 1) {
    return ['50']
  }
  const sizeOpts = pageSizeOpts.filter(e => Number(e) < total)
  return [...sizeOpts, total.toString()].sort((a, b) => {
    return Number(a) > Number(b) ? 1 : -1
  })
})

// 页码切换事件
const handlePageChange = (page, pageSize) => {
  const limit = pageSize
  const offset = (page - 1) * pageSize
  fnGetData(limit, offset)
}

const handlePageSizeChange = (current, size) => {
  pageSize = size
}

const getVxeGridInst = () => {
  return xGrid
}
// 行选择事件
const handleCheckboxChange = debounce(async(row) => {
  if (props.checkOneRow) {
    const checkable = xGrid.isCheckedByCheckboxRow(row)
    await xGrid.clearCheckboxRow()
    xGrid.setCheckboxRow(row, !checkable)
  } else {
    await xGrid.toggleCheckboxRow(row)
  }
  const checkedRows = xGrid.getCheckboxRecords()
  emit('grid-events', { event: 'checkboxOne', params: { records: checkedRows }, name: '复选框单选切换' })
}, 10)

// 表格刷新
const fnRefresh = async () => {
  // 由于固定列的动态切换是无状态的，所以需要手动刷新滚动位置
  await nextTick()
  if (xGrid) {
    await xGrid.refreshColumn()
    await xGrid.refreshScroll()
  }
}
const offsetShow = computed(() => {
  return props.rowData?.offset ?? 0
})
const total = $computed(() => {
  return props.rowData.total ? props.rowData.total : 0
})

const gridOptions = reactive({
  size: props.size,
  border: props.border ? true : 'inner',
  keepSource: props.keepSource,
  showHeaderOverflow: true,
  showOverflow: true,
  highlightHoverRow: true,
  highlightCurrentRow: true,
  resizable: props.resizable,
  height: 500,
  columnConfig: { resizable: props.resizable },
  round: true,
  loading: false,
  rowConfig: { keyField: 'id', height: props.cellHeight },
  checkboxConfig: { checkField: 'checked' },
  editConfig: props.editConfig,
  treeConfig: props.treeConfig,
  stripe: isNilOrEmpty(props.treeConfig) ? false : props.stripe,
})
watchEffect(() => {
  gridOptions.size = props.size
  gridOptions.border = props.border ? true : 'inner'
  gridOptions.stripe = props.stripe
  gridOptions.columnConfig.resizable = props.resizable
  gridOptions.loading = props.dataLoading
})
watch(() => props.treeConfig, async (val) => {
}, { immediate: true, deep: true })

watch(() => props.colDef, val => {
  fnLoadCol(val)
}, { deep: true })

const fnLoadCol = async (val = props.colDef) => {
  const checkbox = {
    field: null,
    title: '序号',
    width: 50,
    type: 'checkbox',
    fixed: 'left',
    showOverflow: false,
    slots: { checkbox: 'checkbox' },
  }
  const operation = {
    field: null,
    title: '操作',
    headerClassName: 'vxe-header-operation',
    width: props.operationWidth,
    type: null,
    fixed: 'right',
    showOverflow: false,
    slots: { default: 'operation' },
  }
  // const serial = { field: null, title: '序号', width: 50, type: 'seq', fixed: 'left' }
  const columns = val.map((e) => {
    // 增加对可配置隐藏列的过滤，兼容之前的
    if (props.hideCols) {
      if (props.hideCols[e.fieldName]) {
        e.hide = true
      }
    }
    return e
  }).filter(e => !e.hide).map(e => {
    let a = {
      field: e.fieldName,
      title: e.alias ? e.alias : e.fieldName,
      width: e.width,
      align: e.align,
      className: e.showType === 'expand' ? 'vxe-expand-customized' : '',
      type: e.showType === 'expand' ? 'expand' : null,
      fixed: e.pinned,
      editRender: e.readonly ? null : { autofocus: '.ant-input' },
      treeNode: e.treeNode === true,
      params: e,
      showOverflow: isNil(e.showOverflow),
    }

    return a
  })
  let columnShow = []
  if (props.checkboxEnabled) {
    columnShow = [checkbox, ...columns]
  } else {
    columnShow = [...columns]
  }
  if (props.showOperation) {
    columnShow.push(operation)
  }

  await nextTick(() => {
    if (xGrid) {
      xGrid.loadColumn(columnShow)
      editedRows = []
    }
  })
}
watch(() => props.rowData, () => {
  fnLoadData()
}, { deep: true })

const fnLoadData = async () => {
  gridOptions.loading = true
  if (xGrid) {
    await xGrid.loadData(props.rowData.dataList)
    gridOptions.loading = false
    editedRows = []
  }
}
// 高度
watchDebounced(top, (newVal) => {
  if (props.fixedHeight) {
    gridOptions.height = props.fixedHeight
  } else {
    gridOptions.height = clientHeight.value - newVal - props.spaceFix
  }
}, { debounce: 100 })

// 修改前的表格原始数据
let editedRowsDataOrig = $ref([])
const handleEditActived = ({ row, column }) => {
  const rowIdx = editedRowsDataOrig.findIndex(e => e.id === row.id)
  if (rowIdx > -1) {
    editedRowsDataOrig.splice(rowIdx, 1, { ...editedRowsDataOrig[rowIdx], [column.field]: row[column.field] })
  } else {
    editedRowsDataOrig.push({ id: row.id, [column.field]: row[column.field] })
  }
}
// 修改后的表格数据
let editedRows = $ref([])
const handleEditClosed = ({ row, column }) => {
  const orgRowData = editedRowsDataOrig.find(e => e.id === row.id)
  if (equals(orgRowData[column.field], row[column.field])) {
    // console.log('单元格未修改')
    return
  }
  const rowIdx = editedRows.findIndex(e => e.id === row.id)
  if (rowIdx > -1) {
    editedRows.splice(rowIdx, 1, { ...editedRows[rowIdx], [column.field]: row[column.field] })
  } else {
    editedRows.push({ id: row.id, [column.field]: row[column.field] })
  }
}

// 数据获取函数
const fnGetData = (limit = pageSize, offset = 0) => {
  emit('update-row-data', { limit, offset, colFilter: tableParams })
}
watchOnce($$(xGrid), async (e) => {
  await fnLoadCol()
  fnLoadData()
})
onMounted(() => {
  // 就绪后触发数据更新，以保证所有条件最新
  // fnLoadData()
})

defineExpose({ getVxeGridInst, fnRefresh, fnGetData, fnLoadData, xGrid: $$(xGrid), showSettings })
</script>
