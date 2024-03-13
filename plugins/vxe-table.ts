import VXETable from 'vxe-table'
import 'vxe-table/lib/style.min.css'
import VXETablePluginElement from 'vxe-table-plugin-element'

export default defineNuxtPlugin((nuxtApp) => {
  VXETable.use(VXETablePluginElement)
  VXETable.config({ keepSource: true })
  nuxtApp.vueApp.use(VXETable)
})
