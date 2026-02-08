<script setup lang="ts">
import { Trophy, Shield, Zap, Users, Wallet, Loader2 } from 'lucide-vue-next'
import { useBreadcrumbs } from '~/composables/useBreadcrumbs'
import { useWallet } from '~/composables/useWallet'
import UserAvatar from '~/components/common/UserAvatar.vue'
// Utility functions (formatSui, truncateAddress) and types are now auto-imported or global

definePageMeta({
    layout: 'content'
})

const route = useRoute()
const tournamentId = route.params.id as string
const { isConnected, truncatedAddress: walletAddress, address: fullAddress } = useWallet()
const { fetchTournament, toDisplayFormat, registerForTournament, loading, error } = useTournaments()
const { games } = useGames()
const { setBreadcrumbs } = useBreadcrumbs()

// Tournament data
const tournament = ref<any>(null)
const displayTournament = ref<any>(null)
const registering = ref(false)

// Fetch tournament on mount
onMounted(async () => {
    const data = await fetchTournament(tournamentId)
    if (data) {
        tournament.value = data
        displayTournament.value = toDisplayFormat(data)

        // Set breadcrumbs
        const game = games.find(g => g.slug === data.gameType)
        setBreadcrumbs([
            { label: 'Home', to: '/' },
            { label: game?.title || data.gameType, to: '/' },
            { label: data.name }
        ])
    }
})

// Computed values for display
const prizePool = computed(() => {
    if (!tournament.value) return { total: '0', entry: '0', sponsor: '0', hasSponsor: false, isFree: false }
    const sponsor = BigInt(tournament.value.sponsorPool || 0)
    const player = BigInt(tournament.value.playerPool || 0)
    const entry = BigInt(tournament.value.entryFee || 0)
    const total = sponsor + player

    return {
        total: formatSui(total),
        entry: formatSui(entry),
        sponsor: formatSui(sponsor),
        hasSponsor: sponsor > 0n,
        isFree: entry === 0n
    }
})



const now = useNow()

const timerDisplay = computed(() => {
    if (!tournament.value) return '00:00:00'
    const currentTime = now.value.getTime()
    const date = tournament.value.date

    if (date <= currentTime || displayTournament.value?.status === 'LIVE') return 'In Progress'

    const diff = date - currentTime
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const participantsList = computed(() => {
    if (!tournament.value) return []
    return tournament.value.participants.map((addr: string, idx: number) => ({
        id: idx,
        name: truncateAddress(addr),
        title: 'Participant'
    }))
})

const isRegistered = computed(() => {
    if (!tournament.value || !fullAddress.value) return false
    return tournament.value.participants.includes(fullAddress.value)
})

const isGM = computed(() => {
    if (!tournament.value || !fullAddress.value) return false
    const gm = tournament.value.gameMaster.toLowerCase()
    const me = fullAddress.value.toLowerCase()
    return gm === me
})

async function handleRegister() {
    if (!tournament.value || !isConnected.value) return

    try {
        registering.value = true
        const success = await registerForTournament(tournamentId, tournament.value.entryFee)
        if (success) {
            // Re-fetch to update UI
            const data = await fetchTournament(tournamentId)
            if (data) {
                tournament.value = data
                displayTournament.value = toDisplayFormat(data)
            }
        }
    } finally {
        registering.value = false
    }
}

// Bracket Logic
const bracketMatches = computed<BracketMatch[]>(() => {
    if (!tournament.value || !tournament.value.matches) return []

    return tournament.value.matches.map((m: ContractMatch) => {
        const formatPlayer = (addr: string | null, isWinner: boolean, isLoser: boolean): BracketPlayer | null => {
            if (!addr) return null
            return {
                id: addr,
                name: truncateAddress(addr),
                avatar: `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${addr}`,
                score: isWinner ? 1 : 0,
                status: isWinner ? 'winner' : isLoser ? 'loser' : 'playing'
            }
        }

        const p1IsWinner = m.winner === m.playerA
        const p1IsLoser = m.winner && m.winner !== m.playerA
        const p2IsWinner = m.winner === m.playerB
        const p2IsLoser = m.winner && m.winner !== m.playerB

        let status: BracketMatchStatus = 'pending'
        if (m.status === 1) status = 'in_progress'
        if (m.status === 2 || m.winner) status = 'completed'

        return {
            id: `match-${m.matchId}`,
            roundId: `round-${m.round}`,
            matchNumber: m.matchId,
            players: [
                formatPlayer(m.playerA, p1IsWinner, !!p1IsLoser),
                formatPlayer(m.playerB, p2IsWinner, !!p2IsLoser)
            ],
            status,
            nextMatchId: m.nextMatchId ? `match-${m.nextMatchId}` : undefined
        }
    })
})

// Bracket rounds configuration
const bracketRounds = computed<BracketRound[]>(() => {
    const totalRounds = tournament.value?.totalRounds || 0
    const currentRound = tournament.value?.currentRound || 1

    return Array.from({ length: totalRounds }, (_, i) => ({
        id: `round-${i + 1}`,
        label: getRoundLabel(i, totalRounds),
        roundIndex: i,
        isActive: i + 1 === currentRound
    }))
})
</script>

<template>
    <div class="min-h-screen pb-40">
        <div class="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0"></div>
        <div
            class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none z-0">
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[400px]">
            <Loader2 class="w-8 h-8 text-primary animate-spin" />
            <span class="ml-3 text-slate-400 font-display uppercase tracking-wider">Loading tournament...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center">
                <div class="text-red-400 font-display uppercase tracking-wider mb-2">Error</div>
                <div class="text-slate-500 text-sm">{{ error }}</div>
            </div>
        </div>

        <!-- Tournament Content -->
        <div v-else-if="tournament">

            <!-- Hero -->
            <div
                class="flex flex-col xl:flex-row xl:items-end justify-between md:gap-56 gap-8 mb-12 border-b border-white/5 pb-8 relative">
                <div class="absolute bottom-0 left-0 w-32 h-px bg-linear-to-r from-primary to-transparent"></div>

                <div class="relative">
                    <div class="flex items-center gap-4 mb-4">
                        <CyberChip :variant="displayTournament?.status.toLowerCase() || 'default'">
                            {{ displayTournament?.status }}
                        </CyberChip>
                    </div>

                    <h1
                        class="text-5xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-xl relative z-10">
                        {{ tournament.name }}
                    </h1>

                    <p class="text-slate-400 max-w-2xl text-lg font-light border-l-2 border-primary/50 pl-4">
                        {{ tournament.description }}
                    </p>
                </div>

                <!-- Timer Box -->
                <div
                    class="flex flex-row xl:flex-col items-center xl:items-end gap-6 xl:gap-2 bg-surface-dark/50 p-4 rounded-lg border border-white/5 w-full xl:w-auto whitespace-nowrap">
                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">
                            {{ displayTournament?.status === 'UPCOMING' ? 'Starts In' : 'Tournament Status' }}
                        </div>
                        <div class="font-display text-xl text-white font-bold tracking-widest tabular-nums text-glow-red"
                            :class="{ 'animate-glow-pulse': timerDisplay === 'In Progress' }">
                            {{ timerDisplay }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <!-- Left Sidebar Info -->
                <div class="lg:col-span-4 space-y-6">
                    <!-- Prize Pool Card -->
                    <CyberCard clip-class="clip-corner-sm" class="overflow-hidden group" content-class="bg-[#0A0F1C]">
                        <div class="absolute inset-0 bg-linear-to-b from-accent-blue/5 to-transparent opacity-50">
                        </div>
                        <div
                            class="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-accent-blue via-purple-500 to-transparent">
                        </div>
                        <div class="p-6 relative z-10">
                            <div class="flex items-center justify-between mb-8">
                                <h3
                                    class="font-display text-lg font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                    <Trophy class="w-5 h-5 text-accent-blue" />
                                    Prize Pool
                                </h3>
                            </div>
                            <div class="space-y-5">
                                <div
                                    class="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-3">
                                    <span class="text-slate-400">Entry Fee</span>
                                    <span class="font-display font-bold tracking-wide"
                                        :class="prizePool.isFree ? 'text-green-400' : 'text-white'">
                                        {{ prizePool.isFree ? 'FREE' : prizePool.entry }}
                                    </span>
                                </div>
                                <div v-if="prizePool.hasSponsor"
                                    class="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-3">
                                    <span class="text-slate-400">Sponsor Contribution</span>
                                    <span class="font-display font-bold text-green-400">+ {{ prizePool.sponsor }}</span>
                                </div>
                                <div class="mt-4 pt-4 bg-black/40 -mx-6 px-6 pb-6 mb-[-24px] border-t border-white/5">
                                    <div class="flex justify-between items-end">
                                        <span
                                            class="text-slate-500 uppercase text-[10px] tracking-widest font-bold mb-1">Total
                                            Pool Value</span>
                                        <span
                                            class="font-display font-black text-4xl text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400">
                                            {{ prizePool.total }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CyberCard>

                    <!-- GM Management Section -->
                    <CyberCard v-if="isGM" variant="primary" clip-class="clip-corner"
                        class="mb-6 relative overflow-hidden group">
                        <div
                            class="absolute inset-0 bg-primary/5 opacity-50 group-hover:opacity-100 transition-opacity">
                        </div>
                        <div class="p-6 relative z-10">
                            <div class="flex items-center gap-3 mb-4">
                                <div
                                    class="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Shield class="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 class="font-display text-sm font-bold uppercase tracking-widest text-primary">
                                        Game Master Access</h3>
                                    <p class="text-[10px] text-slate-400 uppercase tracking-widest">Admin Control Active
                                    </p>
                                </div>
                            </div>

                            <p class="text-xs text-slate-300 leading-relaxed mb-6">
                                You are the designated Game Master for this tournament. Access the dashboard to manage
                                participants and declare winners.
                            </p>

                            <NuxtLink :to="`/tournaments/${tournamentId}/manage`" class="block">
                                <CyberButton variant="primary" block class="text-xs">
                                    Manage Tournament
                                </CyberButton>
                            </NuxtLink>
                        </div>
                    </CyberCard>

                    <!-- Tournament Info -->
                    <div class="bg-surface-dark/50 border border-white/5 p-6 rounded-sm relative">
                        <div class="flex items-center gap-2 mb-6 text-slate-200">
                            <Shield class="w-5 h-5 text-slate-500" />
                            <h3 class="font-display text-base font-bold uppercase tracking-wider">Tournament Info
                            </h3>
                        </div>
                        <ul class="space-y-4">
                            <li class="flex items-start gap-4 group">
                                <div class="text-sm text-slate-400">
                                    <strong
                                        class="block text-slate-200 text-xs uppercase tracking-wide mb-0.5">Location</strong>
                                    {{ tournament.location || 'Online' }}
                                </div>
                            </li>
                            <li class="flex items-start gap-4 group">
                                <div class="text-sm text-slate-400">
                                    <strong class="block text-slate-200 text-xs uppercase tracking-wide mb-0.5">Game
                                        Master</strong>
                                    {{ truncateAddress(tournament.gameMaster) }}
                                </div>
                            </li>
                            <li class="flex items-start gap-4 group">
                                <div class="text-sm text-slate-400">
                                    <strong
                                        class="block text-slate-200 text-xs uppercase tracking-wide mb-0.5">Date</strong>
                                    {{ displayTournament?.date?.toLocaleDateString() }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-8">
                    <!-- Tournament Bracket (Shown when LIVE or ENDED) -->
                    <div v-if="displayTournament?.status === 'LIVE' || displayTournament?.status === 'ENDED'"
                        class="h-full">
                        <BracketTournamentBracket :matches="bracketMatches" :rounds="bracketRounds"
                            :current-round-index="Math.max(0, (tournament?.currentRound || 1) - 1)" />
                    </div>

                    <!-- Tournament Brief (Shown otherwise) -->
                    <div v-else
                        class="bg-surface-dark border border-white/10 rounded-sm p-8 h-full relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-64 h-64 bg-linear-to-bl from-white/5 to-transparent opacity-20 pointer-events-none"
                            style="clip-path: polygon(100% 0, 0 0, 100% 100%);"></div>
                        <div class="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                            <Zap class="w-6 h-6 text-accent-blue" />
                            <h3 class="font-display text-xl font-bold uppercase tracking-wider text-white">Tournament
                                Brief</h3>
                        </div>
                        <div class="prose prose-invert prose-lg max-w-none text-slate-400">
                            <p class="leading-relaxed">
                                {{ tournament.description }}
                            </p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div>
                                    <h4
                                        class="font-display text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <span class="w-1 h-4 bg-primary"></span>
                                        Tournament Details
                                    </h4>
                                    <ul class="space-y-2 text-sm list-none pl-0">
                                        <li class="flex items-center gap-2">
                                            <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
                                            Game: {{ displayTournament?.game }}
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
                                            Entry Fee: <span
                                                :class="prizePool.isFree ? 'text-green-400 font-bold' : ''">{{
                                                    prizePool.isFree ? 'FREE' : prizePool.entry }}</span>
                                        </li>
                                        <li class="flex items-center gap-2">
                                            <span class="w-1 h-1 bg-slate-500 rounded-full"></span>
                                            Participants: {{ tournament.participants.length }}
                                        </li>
                                    </ul>
                                </div>
                                <div class="bg-accent-blue/5 border border-accent-blue/10 p-4 rounded relative">
                                    <p class="text-sm font-medium italic text-slate-300 relative z-10 pl-4 pt-2">
                                        "Victory belongs to the prepared. Good luck to all participants."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Participants -->
            <div class="mb-24">
                <div class="flex items-center justify-between mb-8">
                    <h3
                        class="font-display text-xl font-bold uppercase tracking-wider text-white flex items-center gap-4">
                        <span class="w-2 h-8 bg-linear-to-b from-primary to-purple-600 rounded-sm"></span>
                        Participants
                        <span
                            class="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-sm font-body font-bold">
                            {{ tournament.participants.length }} REGISTERED
                        </span>
                    </h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div v-for="user in participantsList" :key="user.id"
                        class="bg-[#0A0F1C] border border-white/5 p-4 rounded-sm flex items-center gap-4 hover:border-accent-blue/50 transition-all group cursor-pointer relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-accent-blue/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                        <UserAvatar :address="tournament.participants[user.id]" size="10"
                            class-name="rounded p-[1px] bg-linear-to-br from-blue-500 to-purple-600" />


                        <div class="flex-1 min-w-0 relative z-10">
                            <div class="text-sm font-bold text-white truncate font-display tracking-wide">{{ user.name
                                }}
                            </div>
                            <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ user.title }}</div>
                        </div>
                    </div>
                    <!-- Open slot -->
                    <div v-if="tournament.participants.length === 0"
                        class="bg-black/20 border border-white/5 border-dashed p-4 rounded-sm flex items-center justify-center gap-3 opacity-60">
                        <span class="text-[10px] text-slate-500 font-display tracking-[0.2em] uppercase">No Participants
                            Yet</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div v-if="!isRegistered && displayTournament?.status !== 'ENDED'"
            class="fixed bottom-0 left-0 lg:left-24 right-0 p-0 z-40 pointer-events-none flex justify-center">
            <div
                class="bg-[#0A0F1C]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,1)] w-full max-w-[1920px] py-6 px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
                <div class="flex items-center gap-5">
                    <div
                        class="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <Wallet class="w-5 h-5" />
                    </div>
                    <div>
                        <div class="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Connection Status
                        </div>
                        <div v-if="!isConnected"
                            class="text-white font-bold text-sm flex items-center gap-2 font-display tracking-wide">
                            Wallet Not Connected
                            <span class="relative flex h-2 w-2">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                        <div v-else
                            class="text-white font-bold text-sm flex items-center gap-2 font-display tracking-wide">
                            <span class="text-green-400">{{ walletAddress }}</span>
                            <span class="relative flex h-2 w-2">
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <p v-if="tournament" class="text-xs text-slate-500 hidden md:block text-right">
                        Registration {{ prizePool.isFree ? 'is' : 'requires' }} <span
                            :class="prizePool.isFree ? 'text-green-400 font-bold ml-1' : ''">{{
                                prizePool.isFree ? 'FREE' : prizePool.entry }}</span> + Gas
                    </p>
                    <CyberButton variant="primary" class="w-full md:w-auto pl-10 pr-8 py-4"
                        :disabled="!isConnected || registering" @click="handleRegister">
                        <div v-if="registering" class="flex items-center gap-2">
                            <Loader2 class="w-4 h-4 animate-spin" />
                            <span>Processing...</span>
                        </div>
                        <span v-else>Register Now</span>
                    </CyberButton>
                </div>
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
