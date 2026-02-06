// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  // Ensure srcDir is correctly resolved in Nuxt 4
  srcDir: 'app',
  runtimeConfig: {
    public: {
      enokiApiKey: process.env.ENOKI_API_KEY || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    },
  },
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