import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/svg+xml', href: '/images/logo/taisenlogo.svg' },
      ],
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/image', 'shadcn-nuxt', '@vueuse/nuxt', '@nuxt/fonts'],
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  // @ts-ignore - fonts property is valid for @nuxt/fonts
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
      suiNetwork: process.env.NUXT_PUBLIC_SUI_NETWORK || 'devnet',
      packageId: process.env.NUXT_PUBLIC_PACKAGE_ID || '',
      platformConfigId: process.env.NUXT_PUBLIC_PLATFORM_CONFIG_ID || '',
      gameRegistryId: process.env.NUXT_PUBLIC_GAME_REGISTRY_ID || '',
    },
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    }
  },
})