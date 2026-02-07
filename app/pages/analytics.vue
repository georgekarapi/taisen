<script setup lang="ts">
import { Trophy, Users, Wallet, Plus, Calendar, Crown, Loader2 } from 'lucide-vue-next'
import { useWallet } from '~/composables/useWallet'
// formatSui is now auto-imported from utils/tournaments.ts

const { address, isConnected } = useWallet()
const {
    fetchGameMasterTournaments,
    fetchRegisteredTournaments,
    toDisplayFormat,
    loading
} = useTournaments()
const { games } = useGames()

// Dashboard data
const gmTournaments = ref<any[]>([])
const registeredTournaments = ref<any[]>([])
const statsLoading = ref(false)

// Fetch dashboard data when wallet connects
watch(() => address.value, async (newAddress) => {
    if (newAddress) {
        statsLoading.value = true
        try {
            const [gm, registered] = await Promise.all([
                fetchGameMasterTournaments(newAddress),
                fetchRegisteredTournaments(newAddress)
            ])
            gmTournaments.value = gm.map(toDisplayFormat)
            registeredTournaments.value = registered.map(toDisplayFormat)
        } finally {
            statsLoading.value = false
        }
    } else {
        gmTournaments.value = []
        registeredTournaments.value = []
    }
}, { immediate: true })

// Computed stats
const stats = computed(() => [
    {
        title: 'My Registrations',
        value: registeredTournaments.value.length.toString(),
        delta: '',
        icon: 'confirmation_number',
        color: 'secondary',
        progress: Math.min(100, registeredTournaments.value.length * 10)
    },
    {
        title: 'Tournaments (GM)',
        value: gmTournaments.value.length.toString(),
        delta: gmTournaments.value.filter(t => t.status === 'LIVE').length > 0
            ? `${gmTournaments.value.filter(t => t.status === 'LIVE').length} Active`
            : '',
        icon: 'emoji_events',
        color: 'primary',
        progress: Math.min(100, gmTournaments.value.length * 10)
    },
    {
        title: 'Total Earnings',
        value: '0 SUI',
        delta: '',
        icon: 'account_balance_wallet',
        color: 'accent',
        progress: 0
    }
])

// Format tournaments for display
const upcomingTournamentsList = computed(() => {
    return registeredTournaments.value
        .filter(t => t.status === 'UPCOMING' || t.status === 'LIVE')
        .slice(0, 5)
        .map(t => ({
            id: t.id,
            title: t.title,
            game: t.game,
            time: t.countdown,
            image: t.image
        }))
})

const gmTournamentsList = computed(() => {
    return gmTournaments.value.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        game: t.game,
        players: t.teams,
        pool: t.prizepool,
        status: t.status,
        image: t.image
    }))
})
</script>

<template>
    <div class="relative min-h-full">
        <!-- Background Grids (similar to mockup) -->
        <div class="absolute inset-0 pointer-events-none bg-grid-pattern opacity-30 fixed"></div>
        <div
            class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none z-0">
        </div>

        <header
            class="sticky top-0 z-20 backdrop-blur-md border-b border-white/5 px-2 py-5 flex justify-between items-center mb-8">
            <div>
                <h1
                    class="font-display text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-3 drop-shadow-md">
                    <span class="w-1.5 h-6 bg-primary shadow-neon-red skew-x-[-12deg]"></span>
                    Dashboard
                </h1>
            </div>

        </header>

        <div class="max-w-[1600px] mx-auto space-y-10 relative z-10">

            <!-- Not connected message -->
            <div v-if="!isConnected" class="text-center py-20">
                <div class="text-slate-400 font-display uppercase tracking-wider mb-2">Connect Wallet</div>
                <div class="text-slate-500 text-sm">Connect your wallet to view your dashboard</div>
            </div>

            <template v-else>
                <!-- Loading state -->
                <div v-if="statsLoading" class="flex items-center justify-center py-10">
                    <Loader2 class="w-6 h-6 text-primary animate-spin" />
                    <span class="ml-2 text-slate-400">Loading dashboard...</span>
                </div>

                <template v-else>
                    <!-- Stats Grid -->
                    <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <CyberPanel v-for="stat in stats" :key="stat.title" :variant="stat.color as any" hover-effect
                            clip-class="clip-corner" class="min-h-[180px]">
                            <div class="p-6 h-full flex flex-col justify-between">
                                <div class="flex justify-between items-start mb-4 relative z-10">
                                    <h3 class="text-gray-400 font-display text-xs uppercase tracking-widest">{{
                                        stat.title }}
                                    </h3>
                                    <component
                                        :is="stat.icon === 'emoji_events' ? Trophy : stat.icon === 'account_balance_wallet' ? Wallet : Crown"
                                        class="w-6 h-6 opacity-70"
                                        :class="`text-${stat.color === 'primary' ? 'primary' : stat.color === 'secondary' ? 'secondary' : 'blue-400'}`" />
                                </div>

                                <div class="flex items-end gap-3 relative z-10">
                                    <span class="font-display text-4xl font-bold text-white drop-shadow-md">{{
                                        stat.value
                                    }}</span>
                                    <span v-if="stat.delta"
                                        class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                                        :class="stat.color === 'primary' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/10 border-secondary/20 text-secondary'">
                                        {{ stat.delta }}
                                    </span>
                                </div>

                                <!-- Progress Bar -->
                                <div class="w-full bg-gray-800/50 h-1 mt-5 overflow-hidden">
                                    <div class="h-full relative transition-all duration-1000"
                                        :style="{ width: `${stat.progress}%` }"
                                        :class="stat.color === 'primary' ? 'bg-primary shadow-neon-red' : stat.color === 'secondary' ? 'bg-secondary shadow-neon-blue' : 'bg-blue-400'">
                                    </div>
                                </div>
                            </div>
                        </CyberPanel>

                        <!-- Create New Action Card -->
                        <NuxtLink to="/tournaments/create" class="block h-full">
                            <button
                                class="w-full h-full bg-gradient-to-br from-gray-900 to-black border border-white/10 hover:border-primary/50 group p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 clip-corner relative shadow-lg">
                                <div
                                    class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                </div>
                                <div
                                    class="w-12 h-12 rounded-full border border-gray-700 bg-gray-900 group-hover:border-primary group-hover:bg-primary/20 text-gray-400 group-hover:text-primary flex items-center justify-center transition-all shadow-lg">
                                    <Plus class="w-6 h-6" />
                                </div>
                                <span
                                    class="font-display text-gray-300 group-hover:text-white uppercase tracking-wider text-sm font-bold z-10">Create
                                    New</span>
                            </button>
                        </NuxtLink>
                    </section>

                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">

                        <!-- Upcoming Tournaments -->
                        <section class="space-y-6">
                            <div class="flex items-center justify-between border-b border-white/5 pb-2">
                                <h2 class="font-display text-lg text-white uppercase flex items-center gap-3">
                                    <Calendar class="w-5 h-5 text-secondary" />
                                    Upcoming (Registered)
                                </h2>
                            </div>

                            <div v-if="upcomingTournamentsList.length === 0" class="text-center py-8">
                                <div class="text-slate-500 text-sm">No registered tournaments yet</div>
                            </div>

                            <div v-else class="space-y-4">
                                <NuxtLink v-for="trn in upcomingTournamentsList" :key="trn.id"
                                    :to="`/tournaments/${trn.id}`"
                                    class="group relative bg-black/40 border-l-[3px] border-l-secondary border-y border-r border-white/5 hover:border-r-secondary/30 transition-all p-4 flex gap-4 items-center block">
                                    <div
                                        class="absolute inset-0 bg-secondary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none">
                                    </div>

                                    <div
                                        class="w-16 h-16 rounded bg-gray-900 overflow-hidden relative border border-white/10 flex-shrink-0">
                                        <img :src="trn.image"
                                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                                    </div>

                                    <div class="flex-1 min-w-0 z-10">
                                        <h3
                                            class="font-display text-base font-bold text-white group-hover:text-secondary transition-colors truncate">
                                            {{ trn.title }}</h3>
                                        <div class="flex items-center gap-3 mt-1">
                                            <span
                                                class="text-[10px] font-bold uppercase tracking-wider text-secondary border border-secondary/30 px-1.5 rounded-sm bg-secondary/10">{{
                                                    trn.game }}</span>
                                            <span class="text-xs text-gray-500 font-mono">{{ trn.time }}</span>
                                        </div>
                                    </div>

                                    <div class="z-10">
                                        <CyberButton variant="secondary" class="!px-4 !py-2 !text-xs">View</CyberButton>
                                    </div>
                                </NuxtLink>
                            </div>
                        </section>

                        <!-- GM Tournaments -->
                        <section class="space-y-6">
                            <div class="flex items-center justify-between border-b border-white/5 pb-2">
                                <h2 class="font-display text-lg text-white uppercase flex items-center gap-3">
                                    <Trophy class="w-5 h-5 text-primary" />
                                    My Tournaments (GM)
                                </h2>
                            </div>

                            <div v-if="gmTournamentsList.length === 0" class="text-center py-8">
                                <div class="text-slate-500 text-sm">You haven't created any tournaments yet</div>
                            </div>

                            <div v-else class="space-y-4">
                                <NuxtLink v-for="trn in gmTournamentsList" :key="trn.id" :to="`/tournaments/${trn.id}`"
                                    class="relative group border border-primary/30 p-1 rounded-sm shadow-neon-red hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all block">
                                    <div
                                        class="bg-black p-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center h-full relative z-10 transition-colors hover:bg-white/5">
                                        <div
                                            class="w-full sm:w-20 h-20 bg-gray-900 flex-shrink-0 relative overflow-hidden cyber-clip border border-white/10">
                                            <img :src="trn.image"
                                                class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div class="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
                                        </div>

                                        <div class="flex-1 w-full">
                                            <div class="flex justify-between items-start mb-1">
                                                <h3
                                                    class="font-display text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                    {{ trn.title }}</h3>
                                                <CyberBadge
                                                    :variant="trn.status === 'LIVE' ? 'live' : trn.status === 'UPCOMING' ? 'upcoming' : 'ended'">
                                                    {{ trn.status }}
                                                </CyberBadge>
                                            </div>
                                            <p class="text-xs text-gray-500 mb-3">{{ trn.game }}</p>

                                            <div class="flex items-center justify-between">
                                                <div class="flex gap-4 text-xs font-mono text-gray-400">
                                                    <span class="flex items-center gap-1">
                                                        <Users class="w-3 h-3" /> {{ trn.players }}
                                                    </span>
                                                    <span class="flex items-center gap-1">
                                                        <Wallet class="w-3 h-3" /> {{ trn.pool }}
                                                    </span>
                                                </div>
                                                <button
                                                    class="bg-primary hover:bg-red-600 text-white px-4 py-1.5 rounded-sm text-xs font-display font-bold uppercase tracking-wider shadow-neon-red transition-all transform active:scale-95">
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </div>
                        </section>

                    </div>
                </template>
            </template>
        </div>
    </div>
</template>

<style scoped>
.bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}
</style>
