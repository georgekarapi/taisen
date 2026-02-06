// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  runtimeConfig: {
    public: {
      enokiApiKey: process.env.ENOKI_API_KEY || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      suiNetwork: process.env.NUXT_PUBLIC_SUI_NETWORK || 'devnet',
      packageId: process.env.NUXT_PUBLIC_PACKAGE_ID || '',
      platformConfigId: process.env.NUXT_PUBLIC_PLATFORM_CONFIG_ID || '',
      gameRegistryId: process.env.NUXT_PUBLIC_GAME_REGISTRY_ID || '',
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