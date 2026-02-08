<script setup lang="ts">
import { Users, Trophy, PieChart, Timer, Search, Filter, MoreVertical, Play, Pause, XCircle, Loader2, Lock } from 'lucide-vue-next'
import { useBreadcrumbs } from '~/composables/useBreadcrumbs'
import { useWallet } from '~/composables/useWallet'
import UserAvatar from '~/components/common/UserAvatar.vue'

definePageMeta({
    layout: 'content'
})

const route = useRoute()
const router = useRouter()
const tournamentId = route.params.id as string
const { isConnected, address: fullAddress } = useWallet()
const { fetchTournament, toDisplayFormat, loading, error } = useTournaments()
const { games } = useGames()
const { setBreadcrumbs } = useBreadcrumbs()

// Tournament data
const tournament = ref<any>(null)
const displayTournament = ref<any>(null)

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
            { label: game?.title || data.gameType, to: `/games/${data.gameType}` },
            { label: data.name, to: `/tournaments/${tournamentId}` },
            { label: 'Manage' }
        ])

        // Redirect if not GM
        if (fullAddress.value && data.gameMaster !== fullAddress.value) {
            router.push(`/tournaments/${tournamentId}`)
        }
    }
})

// Check if current user is GM
const isGM = computed(() => {
    if (!tournament.value || !fullAddress.value) return false
    const gm = tournament.value.gameMaster.toLowerCase()
    const me = fullAddress.value.toLowerCase()
    return gm === me
})

// Computed stats
const stats = computed(() => {
    if (!tournament.value) return []
    const totalPool = tournament.value.sponsorPool + tournament.value.playerPool
    const gmFee = (Number(totalPool) * tournament.value.gmFeeBps) / 10000

    const statusLabels: Record<number, string> = {
        0: 'UPCOMING',
        1: 'LIVE',
        2: 'ENDED'
    }

    return [
        { title: 'Participants', value: `${tournament.value.participants.length}`, icon: Users, color: 'secondary' },
        { title: 'Prize Pool', value: formatSui(totalPool), icon: Trophy, color: 'primary' },
        { title: `GM Fee (${tournament.value.gmFeeBps / 100}%)`, value: formatSui(BigInt(Math.floor(gmFee))), icon: PieChart, color: 'accent' },
        { title: 'Current State', value: displayTournament.value?.status || statusLabels[tournament.value.status] || 'UNKNOWN', icon: Timer, color: 'success' }
    ]
})

// Participants list for the table
const players = computed(() => {
    if (!tournament.value) return []
    return tournament.value.participants.map((p: Participant, idx: number) => ({
        id: idx + 1,
        address: p.address,
        name: p.username || truncateAddress(p.address),
        status: 'REGISTERED' // Placeholder - could be enhanced with match data
    }))
})

// Selected player for winner declaration

// Generate demo bracket data based on participants
// Generate bracket data from contract matches
const bracketMatches = computed<BracketMatch[]>(() => {
    if (!tournament.value || !tournament.value.matches) return []

    return tournament.value.matches.map((m: ContractMatch) => {
        // Helper to format player
        const formatPlayer = (addr: string | null, isWinner: boolean, isLoser: boolean): BracketPlayer | null => {
            if (!addr) return null
            const participant = tournament.value.participants.find((p: Participant) => p.address === addr)
            return {
                id: addr,
                name: participant?.username || truncateAddress(addr),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${addr}`,
                score: isWinner ? 1 : 0, // Contract matches don't track score, only winner
                status: isWinner ? 'winner' : isLoser ? 'loser' : 'playing'
            }
        }

        // Determine player statuses
        const p1IsWinner = m.winner === m.playerA
        const p1IsLoser = m.winner && m.winner !== m.playerA
        const p2IsWinner = m.winner === m.playerB
        const p2IsLoser = m.winner && m.winner !== m.playerB

        // Determine match status
        // 0: Pending, 1: Ready/InProgress, 2: Completed
        let status: BracketMatchStatus = 'pending'
        if (m.status === 1) status = 'in_progress'
        if (m.status === 2 || m.winner) status = 'completed'

        return {
            id: `match-${m.matchId}`,
            roundId: `round-${m.round}`, // Contract uses 1-based indexing for rounds
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
    <div class="relative min-h-full p-6 lg:p-10 max-w-[1600px] mx-auto pb-20">
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

        <!-- Content -->
        <template v-else-if="tournament">
            <!-- Header -->
            <div
                class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div class="flex items-center gap-4">
                        <h1
                            class="text-3xl lg:text-5xl font-display font-bold uppercase text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                            {{ tournament.name }}
                        </h1>
                        <CyberChip :variant="displayTournament?.status?.toLowerCase() || 'default'">
                            {{ displayTournament?.status }}
                        </CyberChip>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <div
                        class="px-4 py-2 bg-surface-dark border border-white/10 rounded font-mono text-sm text-gray-400">
                        <span class="text-gray-600 mr-2">ID:</span>{{ truncateAddress(tournamentId) }}
                    </div>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <CyberPanel v-for="stat in stats" :key="stat.title" clip-class="clip-corner" hover-effect
                    class="p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <component :is="stat.icon" class="w-16 h-16" />
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-1 h-4 shadow-neon-blue"
                            :class="stat.color === 'primary' ? 'bg-primary' : stat.color === 'secondary' ? 'bg-secondary' : 'bg-green-500'">
                        </div>
                        <p class="text-gray-400 font-body text-xs uppercase tracking-[0.2em]">{{ stat.title }}</p>
                    </div>
                    <h3 class="text-4xl font-display font-bold text-white mt-4">{{ stat.value }}</h3>
                </CyberPanel>
            </div>



            <div class="flex flex-col lg:flex-row gap-8">
                <!-- Tournament Bracket -->
                <div class="flex-1 order-2 lg:order-1 relative">
                    <div v-if="bracketMatches.length > 0" class="h-full">
                        <BracketTournamentBracket :matches="bracketMatches" :rounds="bracketRounds"
                            :current-round-index="Math.max(0, (tournament?.currentRound || 1) - 1)" :is-gm="isGM"
                            :tournament-id="tournamentId" />
                    </div>
                    <div v-else
                        class="h-full flex items-center justify-center p-10 bg-surface-dark border border-white/5 rounded">
                        <p class="text-slate-500 font-display uppercase tracking-widest text-sm">Bracket will be
                            generated on start</p>
                    </div>
                </div>

                <!-- Admin Sidebar -->
                <div class="w-full lg:w-96 order-1 lg:order-2 flex flex-col gap-6">
                    <div class="relative">
                        <div
                            class="absolute -top-3 left-6 z-10 bg-black px-2 text-primary font-bold text-[10px] tracking-[0.3em] border border-primary/30 rounded uppercase">
                            Admin Control
                        </div>
                        <div
                            class="clip-corner bg-black border border-primary/50 shadow-[0_0_20px_rgba(255,0,60,0.15)] p-6 relative">
                            <!-- spacer to account for the top label visual space if needed, or just standard padding -->
                            <div class="space-y-6 mt-2">
                                <p class="text-[10px] text-gray-400 leading-relaxed border-l-2 border-primary/30 pl-3">
                                    <strong class="text-primary block mb-1">Warning:</strong>
                                    Cancelling the tournament will immediately stop all active matches and <span
                                        class="text-white">refund all participants</span> their entry fees. This action
                                    cannot be undone.
                                </p>

                                <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                    <CyberButton variant="ghost"
                                        class="w-full text-[10px] flex items-center justify-center bg-surface-light border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-sm">
                                        <Pause class="w-4 h-4 mr-2" /> Pause
                                    </CyberButton>
                                    <CyberButton variant="outline"
                                        class="w-full text-[10px] text-red-500 hover:text-white bg-red-500/50! hover:bg-red-500! flex items-center justify-center">
                                        <XCircle class="w-4 h-4 mr-2" /> Cancel
                                    </CyberButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Active Players Table -->
            <div class="relative mt-8">
                <div class="clip-corner-lg bg-surface-dark border border-white/5 shadow-2xl overflow-hidden relative">
                    <!-- Locked Overlay -->
                    <div v-if="displayTournament?.status === 'UPCOMING'"
                        class="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border border-white/5">
                        <Lock class="w-8 h-8 text-slate-600 mb-4" />
                        <p class="text-slate-500 font-display uppercase tracking-wider text-sm font-bold">
                            Table locked until start
                        </p>
                    </div>
                    <div
                        class="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-black/20">
                        <h2 class="font-display font-bold text-xl text-white flex items-center gap-3">
                            <Users class="w-5 h-5 text-secondary" />
                            Active Players
                        </h2>
                        <div class="flex gap-2 w-full sm:w-auto items-center">
                            <div class="relative flex-1 sm:flex-initial w-full sm:w-64">
                                <CyberInput placeholder="Search ID or Alias..." class="w-full" container-class="w-full"
                                    variant="secondary">
                                    <template #icon>
                                        <Search class="w-4 h-4" />
                                    </template>
                                </CyberInput>
                            </div>
                            <CyberButton variant="ghost" square
                                class="h-[42px] w-[42px] flex items-center justify-center bg-surface-light border border-white/10 hover:bg-white/10 text-white rounded-sm">
                                <Filter class="w-4 h-4" />
                            </CyberButton>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead
                                class="bg-black/40 text-gray-500 font-body text-xs uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th class="p-5 font-bold">#</th>
                                    <th class="p-5 font-bold">Address</th>
                                    <th class="p-5 font-bold">Status</th>
                                    <th class="p-5 font-bold text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5 text-sm">
                                <tr v-for="player in players" :key="player.id"
                                    class="group hover:bg-white/2 transition-colors">
                                    <td class="p-5 text-gray-500 font-mono">{{ player.id }}</td>
                                    <td class="p-5 flex items-center gap-4">
                                        <UserAvatar :address="player.address" size="10"
                                            class-name="border-secondary/50" />

                                        <div>
                                            <div class="font-display font-bold text-white tracking-wide">
                                                {{ player.name }}</div>
                                            <div class="text-[10px] text-gray-600 font-mono">{{ player.address }}
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-5">
                                        <CyberBadge variant="upcoming" class="text-[10px]">
                                            {{ player.status }}
                                        </CyberBadge>
                                    </td>
                                    <td class="p-5 text-right">
                                        <MoreVertical
                                            class="w-4 h-4 ml-auto text-gray-600 cursor-pointer hover:text-white" />
                                    </td>
                                </tr>
                                <tr v-if="players.length === 0">
                                    <td colspan="4" class="p-10 text-center text-gray-500">
                                        No participants registered yet
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


        </template>
    </div>
</template>

<style scoped>
.clip-corner-lg {
    clip-path: polygon(24px 0, 100% 0,
            100% calc(100% - 24px), calc(100% - 24px) 100%,
            0 100%, 0 24px);
}
</style>
