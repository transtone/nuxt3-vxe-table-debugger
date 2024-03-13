// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import ViteComponents from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  app: {
    head: {
      title: 'vxe-grid debug',
      link: [{ rel: 'icon', type: 'image/*', href: '/favicon.svg' }],
    },
  },
  modules: [
    '@unocss/nuxt',
    '@vue-macros/nuxt',
    '@pinia/nuxt',
    'unplugin-icons/nuxt',
    '@vueuse/nuxt',
  ],
  css: [
    '@unocss/reset/tailwind.css',
    '@/assets/main.css',
    '@/assets/normal.scss',
    '@/assets/vxe-cust.scss',
  ],
  vite: {
    plugins: [
      ViteComponents({
        resolvers: [
          IconsResolver({
            componentPrefix: 'i',
          }),
        ],
        dts: true,
      }),
    ],
  },
  plugins: ['@/plugins/vxe-table'],
})
