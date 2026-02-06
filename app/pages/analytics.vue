<script setup lang="ts">
import { Trophy, Users, Wallet, Plus, Calendar, Crown, Gamepad2 } from 'lucide-vue-next'

const stats = [
    {
        title: 'My Registrations',
        value: '12',
        delta: '+2 this week',
        icon: 'confirmation_number',
        color: 'secondary',
        progress: 75
    },
    {
        title: 'Tournaments (GM)',
        value: '4',
        delta: '1 Active',
        icon: 'emoji_events',
        color: 'primary',
        progress: 25
    },
    {
        title: 'Total Earnings',
        value: '$850',
        delta: '',
        icon: 'account_balance_wallet',
        color: 'accent',
        progress: 50
    }
]

const upcomingTournaments = [
    {
        id: 1,
        title: 'Neon City Showdown',
        game: 'VALORANT',
        time: 'Starts in 2h 45m',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmLrOumRlKZskjKAIGXbHjrb9DicEr4k4Hpm8Z9FCO1DpWPmbXgz13My5Hov-SvI4nooOtDagxPXGmj4rLUxoNMAybEq2ghwAkbEoLSz0xF3ZewQSZ95q6O9WhKw3_zaE6u5yYqCkoUQ3ZrAruUcuKiKb3Ne_9yqpPwWL9hCzuHe1I0IfX7oD0b9SeoxrnErP4EDJvvaFOenkxNrYIpVzK6u_SN62Y5Cdd_sKWBT8JYhHscql947cyI8zdHh-0s7tfDIQhJWKm8U8'
    },
    {
        id: 2,
        title: 'The Tavern Brawl 24',
        game: 'HEARTHSTONE',
        time: 'Nov 14, 20:00',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpuPAnBKqigr4gVe0IzRGoDL4N95dWfzucToWZ-pygXJbn3jZaOcNujjW6VhB6CEwvUgRQfQskDA4TONYpOBumYPQfTnmptzTKuWo8r1Zvz0LBZNUYeqb-lj5HlcmKZbXq7hcTF6ROusQlO00lQqYd_ki5qgFE8FyPkgzSP3pUc6ZQVDBYDdv46zNOvCB_PuChTJXOQNoNTCAxVOBVkFii6sILJcqgDtW6ZLwkbnbnXC3hpg3j360G4x1avTBYp_61viDTKE9Zxn8'
    }
]

const gmTournaments = [
    {
        id: 1,
        title: 'CyberCircuit: Alpha',
        game: 'League of Legends • 5v5 Draft',
        players: '128',
        pool: '$10k',
        status: 'LIVE',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChmmqpFkt41nqcA7OA5NhXRL3VQByGAg2jJ8Qlz1NX850KwgD0aEKw-yS7zffm7Ww-EjDngLtvjBXlkIIa297eQ-gWes6xACvuTudEST1DIwV8sTU-ZEhCqkB9LU2Bsff5iakcDT-EeGovezhWfB0HIR84bLng0MUH0ITMZobh3QBPbKP78zR-Ul7BZDs2udq1rRAEilKHCFfqTATgThlOLWVkMvKCNkDdQktU5OnLp_Yda9UIomV_70H5l3duTeCURYwWLPvumHU'
    },
    {
        id: 2,
        title: 'Midnight Protocol #4',
        game: 'TFT • Free for All',
        players: '14/32',
        pool: 'Oct 30',
        status: 'DRAFTING',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP3Kpa6VZhF8_cUL4qdzgdwr9HlfigfqbWkWgl1gClf-Oji_odO1HlYZKBgFigihsKkayx-reRUTMzOLMvV6F6E08-A1r2FM992INPw_jMbfmyXKGAwC7S8witHfN4ElIsdyc0OaNXMKs_TvE20icC-nP7_zcvcFNMFyG4bFEUSmTTwXDIJG553xGR8nrzESvUb8YssYq9bSdrueWDyMpzAjhHJHi-tFlcGK8maQ5Bjw-Al_AouhpxMumRFomw6dag1yX7q9rVVVY'
    }
]
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

            <!-- Stats Grid -->
            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CyberPanel v-for="stat in stats" :key="stat.title" :variant="stat.color as any" hover-effect
                    clip-class="clip-corner" class="min-h-[180px]">
                    <div class="p-6 h-full flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-4 relative z-10">
                            <h3 class="text-gray-400 font-display text-xs uppercase tracking-widest">{{ stat.title }}
                            </h3>
                            <!-- Icons placeholder - using text/colors -->
                            <!-- Ideally use unplugin-icons or similar, but simplified here -->
                            <component
                                :is="stat.icon === 'emoji_events' ? Trophy : stat.icon === 'account_balance_wallet' ? Wallet : Crown"
                                class="w-6 h-6 opacity-70"
                                :class="`text-${stat.color === 'primary' ? 'primary' : stat.color === 'secondary' ? 'secondary' : 'blue-400'}`" />
                        </div>

                        <div class="flex items-end gap-3 relative z-10">
                            <span class="font-display text-4xl font-bold text-white drop-shadow-md">{{ stat.value
                                }}</span>
                            <span v-if="stat.delta" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
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
                        <a href="#"
                            class="text-xs text-secondary hover:text-white uppercase tracking-wider font-bold transition-colors">View
                            All</a>
                    </div>

                    <div class="space-y-4">
                        <div v-for="trn in upcomingTournaments" :key="trn.id"
                            class="group relative bg-black/40 border-l-[3px] border-l-secondary border-y border-r border-white/5 hover:border-r-secondary/30 transition-all p-4 flex gap-4 items-center">
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
                                <CyberButton variant="secondary" class="!px-4 !py-2 !text-xs">Lobby</CyberButton>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- GM Tournaments -->
                <section class="space-y-6">
                    <div class="flex items-center justify-between border-b border-white/5 pb-2">
                        <h2 class="font-display text-lg text-white uppercase flex items-center gap-3">
                            <Trophy class="w-5 h-5 text-primary" />
                            My Tournaments (GM)
                        </h2>
                        <a href="#"
                            class="text-xs text-primary hover:text-white uppercase tracking-wider font-bold transition-colors">View
                            All</a>
                    </div>

                    <div class="space-y-4">
                        <div v-for="trn in gmTournaments" :key="trn.id"
                            class="relative group border border-primary/30 p-1 rounded-sm shadow-neon-red hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
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
                                        <CyberBadge :variant="trn.status === 'LIVE' ? 'live' : 'ended'">{{ trn.status }}
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
                                        <NuxtLink :to="`/tournaments/${trn.id}/manage`">
                                            <button
                                                class="bg-primary hover:bg-red-600 text-white px-4 py-1.5 rounded-sm text-xs font-display font-bold uppercase tracking-wider shadow-neon-red transition-all transform active:scale-95">
                                                Manage
                                            </button>
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
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
