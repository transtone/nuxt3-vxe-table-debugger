<template>
  <div class="">
    <el-config-provider :locale="zhCN">
      <slot />
    </el-config-provider>
  </div>
</template>

<script setup>
import zhCN from 'element-plus/dist/locale/zh-cn.mjs'

</script>
