<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
const { games } = useGames()

const sidebarGames = computed(() => games.filter(g => g.logo))
</script>

<template>
    <nav class="flex h-full w-24 flex-shrink-0 flex-col items-center border-r border-cyber-panel bg-cyber-panel z-40">
        <div class="mb-8 flex w-full justify-center py-6">
            <NuxtLink to="/">
                <img alt="Taisen Logo"
                    src="/images/logo/taisenlogo.svg"
                    class="w-[60px] p-[5px] mix-blend-screen" />
            </NuxtLink>
        </div>

        <div class="flex w-full flex-col gap-2">
            <NuxtLink v-for="game in sidebarGames" :key="game.slug" :to="`/games/${game.slug}`"
                class="group relative flex h-16 w-full items-center justify-center text-white/40 transition-all duration-300 hover:text-white"
                active-class="sidebar-active">
                <NuxtImg :src="game.logo" :alt="game.title" :class="[
                    'h-12 w-12 rounded-2xl object-cover transition-all duration-300',
                    $route.path.includes(game.slug) ? 'opacity-100 border-2 border-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.5)]' : 'opacity-50 group-hover:opacity-100'
                ]" />

                <!-- Tooltip -->
                <div
                    class="absolute left-full ml-4 hidden rounded bg-cyber-panel px-3 py-2 text-sm text-white group-hover:block whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {{ game.title }}
                </div>
            </NuxtLink>
        </div>

        <div class="mb-8 mt-auto flex w-full justify-center">
            <a href="#" class="text-white/40 transition-all duration-300 hover:text-white">
                <Settings class="h-6 w-6" />
            </a>
        </div>
    </nav>
</template>
