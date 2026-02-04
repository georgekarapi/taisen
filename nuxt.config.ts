// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@vueuse/nuxt'],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  }
})