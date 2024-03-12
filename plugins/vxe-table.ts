import VXETable from 'vxe-table'
import 'vxe-table/lib/style.min.css'

export default defineNuxtPlugin((nuxtApp) => {
  VXETable.config({ keepSource: true })
  nuxtApp.vueApp.use(VXETable)
})
