<script setup lang="ts">
import { Trophy, Users, Zap, Calendar, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string
const { getGameBySlug } = useGames()

const game = computed(() => getGameBySlug(slug) || {
    title: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    slug: slug,
    banner: '~/assets/images/banners/default.jpg',
    logo: '~/assets/images/game-icons/mtg.png', // Fallback
    sidebarIcon: '~/assets/images/game-icons/mtg.png'
})
</script>

<template>
    <div class="min-h-screen">
        <!-- Hero Section -->
        <div class="relative h-[400px] overflow-hidden">
            <div class="absolute inset-0">
                <NuxtImg :src="game.banner" :alt="game.title"
                    class="w-full h-full object-cover transform scale-105 blur-sm opacity-50" />

                <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            </div>

            <div class="relative container mx-auto px-6 h-full flex flex-col justify-end pb-12">
                <div class="flex items-center gap-6 mb-4">
                    <div
                        class="w-24 h-24 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden shadow-neon-blue">
                        <NuxtImg :src="game.logo" :alt="game.title" class="w-full h-full object-cover p-4" />
                    </div>
                    <div>
                        <h1
                            class="text-5xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter mb-2">
                            {{ game.title }}
                        </h1>
                        <div class="flex items-center gap-4 text-white/60 uppercase tracking-widest text-xs font-bold">
                            <span class="flex items-center gap-1.5">
                                <Zap class="w-3 h-3 text-primary" /> 1.2k Live
                            </span>
                            <span class="flex items-center gap-1.5">
                                <Users class="w-3 h-3 text-secondary" /> 45k Players
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container mx-auto px-6 py-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Left Content -->
                <div class="lg:col-span-8 space-y-8">
                    <!-- About Section -->
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <h2
                            class="text-xl font-display font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <div class="w-1 h-6 bg-primary"></div>
                            About {{ game.title }}
                        </h2>
                        <p class="text-white/60 leading-relaxed max-w-3xl">
                            Experience the cutting-edge of blockchain TCG gaming. {{ game.title }} on Taisen brings you
                            high-stakes tournaments, verified fair play, and instant prize distributions. Connect your
                            neural link and join the competitive ranks today.
                        </p>
                    </div>

                    <!-- Placeholder for Tournaments -->
                    <div class="space-y-4">
                        <h2
                            class="text-xl font-display font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <div class="w-1 h-6 bg-secondary"></div>
                            Upcoming Tournaments
                        </h2>
                        <div v-for="i in 3" :key="i"
                            class="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between group hover:bg-white/10 hover:border-white/20 transition-all cursor-not-allowed opacity-50">
                            <div class="flex items-center gap-6">
                                <div
                                    class="w-12 h-12 rounded bg-black/20 flex flex-col items-center justify-center border border-white/5">
                                    <span class="text-[10px] text-white/40 font-bold uppercase">Feb</span>
                                    <span class="text-lg font-black text-white leading-none">{{ 12 + i }}</span>
                                </div>
                                <div>
                                    <div class="text-white font-bold tracking-wide uppercase">Deep Grid Championship
                                    </div>
                                    <div class="text-[10px] text-white/40 uppercase tracking-widest mt-1">Sui Devnet •
                                        500 USDC Pool</div>
                                </div>
                            </div>
                            <Calendar class="w-5 h-5 text-white/20" />
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="lg:col-span-4 space-y-6">
                    <div
                        class="bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                        <h3 class="text-white font-bold tracking-wider uppercase mb-4">Quick Stats</h3>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-white/40 uppercase tracking-widest">Global Rank</span>
                                <span class="text-white font-mono">#402</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-white/40 uppercase tracking-widest">Win Rate</span>
                                <span class="text-green-400 font-mono">68.5%</span>
                            </div>
                            <div class="flex justify-between items-center text-sm">
                                <span class="text-white/40 uppercase tracking-widest">Total Earned</span>
                                <span class="text-primary font-bold font-mono">1,450 SUI</span>
                            </div>
                        </div>
                        <button
                            class="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 text-white/60 hover:text-white">
                            View Profile
                            <ExternalLink class="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
