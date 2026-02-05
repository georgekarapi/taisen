// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  srcDir: 'app/',
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/tailwindcss', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxtjs/google-fonts'],
  googleFonts: {
    families: {
      Orbitron: [400, 600, 700, 900],
      Rajdhani: [400, 500, 600, 700],
    },
    display: 'swap',
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  }
})