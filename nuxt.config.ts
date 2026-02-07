import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxt/fonts'],
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  fonts: {
    families: [
      {
        name: 'Orbitron',
        provider: 'google',
        weights: [400, 500, 600, 700, 800, 900],
      },
      {
        name: 'Rajdhani',
        provider: 'google',
        weights: [300, 400, 500, 600, 700],
      },
    ],
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  imports: {
    dirs: ['@/types/*.d.ts']
  },
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
})