// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', 'shadcn-nuxt', '@vueuse/nuxt'],
  shadcn: {
    prefix: '',
    componentDir: 'components/ui'
  }
})