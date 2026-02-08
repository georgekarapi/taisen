<script setup lang="ts">
import { Users, Zap, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const slug = route.params.slug as string
const { getGameBySlug } = useGames()
const { fetchAllTournaments, getDisplayTournaments, loading, error } = useTournaments()

const game = computed(() => getGameBySlug(slug) || {
    title: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    slug: slug,
    banner: '/images/banners/default.webp',
    logo: '/images/game-icons/mtg.webp',
    description: '',
})

// Fetch tournaments on mount
const hasFetched = ref(false)
const isMounted = ref(false)

onMounted(async () => {
    isMounted.value = true
    await fetchAllTournaments()
    hasFetched.value = true
})

const displayTournaments = getDisplayTournaments()

// Filter to upcoming/live tournaments for this game
const gameTournaments = computed(() => {
    return displayTournaments.value.filter(t =>
        t.game === game.value.title && (t.status === 'UPCOMING' || t.status === 'LIVE')
    )
})

const showSkeleton = computed(() => !isMounted.value || loading.value || !hasFetched.value)
</script>

<template>
    <div class="min-h-screen absolute top-0 left-0 right-0">
        <!-- Hero Section -->
        <div class="relative h-[400px] overflow-hidden">
            <div class="absolute inset-0">
                <NuxtImg :src="game.banner" :alt="game.title"
                    class="w-full h-full object-cover transform scale-105 opacity-50" />

                <div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
            </div>

            <div class="relative container mx-auto px-6 h-full flex flex-col justify-end pb-12">
                <div class="flex items-center gap-6 mb-4">
                    <div
                        class="w-24 h-24 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden shadow-neon-blue p-4">
                        <NuxtImg :src="game.logo" :alt="game.title" class="w-full h-full rounded-md object-cover" />
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
                    <CyberCard class="backdrop-blur-sm" content-class="p-8 bg-white/5">
                        <h2
                            class="text-xl font-display font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <div class="w-1 h-6 bg-primary"></div>
                            About {{ game.title }}
                        </h2>
                        <p class="text-white/60 leading-relaxed max-w-3xl">
                            {{ game.description }}
                        </p>
                    </CyberCard>

                    <!-- Upcoming Tournaments -->
                    <div class="space-y-4">
                        <h2
                            class="text-xl font-display font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-3">
                            <div class="w-1 h-6 bg-secondary"></div>
                            Upcoming Tournaments
                        </h2>

                        <div v-if="showSkeleton" class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <HomeTournamentCardSkeleton v-for="i in 3" :key="i" />
                        </div>

                        <div v-else-if="error" class="text-center py-20">
                            <div class="text-red-400 font-display uppercase tracking-wider mb-2">Error loading
                                tournaments</div>
                            <div class="text-slate-500 text-sm">{{ error }}</div>
                        </div>

                        <div v-else-if="gameTournaments.length === 0" class="text-center py-20">
                            <div class="text-slate-400 font-display uppercase tracking-wider">No upcoming tournaments
                            </div>
                            <div class="text-slate-500 text-sm mt-2">Check back soon for new {{ game.title }}
                                tournaments</div>
                        </div>

                        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <TournamentCard v-for="tournament in gameTournaments" :key="tournament.id"
                                :tournament="tournament" />
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div class="lg:col-span-4 space-y-6">
                    <CyberCard class="backdrop-blur-md"
                        content-class="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/80">
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
                    </CyberCard>
                </div>
            </div>
        </div>
    </div>
</template>

