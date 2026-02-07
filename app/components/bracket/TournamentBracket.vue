<script setup lang="ts">
import { ListTree } from 'lucide-vue-next'

/**
 * TournamentBracket - Main bracket container component
 * State-driven filtering with responsive layout
 */

const props = withDefaults(
    defineProps<{
        matches: BracketMatch[]
        rounds?: BracketRound[]
        currentRoundIndex?: number
    }>(),
    {
        currentRoundIndex: 0
    }
)

// Generate default rounds if not provided
const bracketRounds = computed<BracketRound[]>(() => {
    let rounds: BracketRound[] = []

    if (props.rounds && props.rounds.length > 0) {
        rounds = props.rounds
    } else {
        // Extract unique round IDs from matches and create labels
        const uniqueRoundIds = [...new Set(props.matches.map((m) => m.roundId))]
        const labels = ['Round 1', 'Round 2', 'Round 3', 'Quarterfinals', 'Semifinals', 'Finals']
        rounds = uniqueRoundIds.map((id, index) => ({
            id,
            label: labels[index] || `Round ${index + 1}`,
            roundIndex: index,
            isActive: index === props.currentRoundIndex
        }))
    }

    // Determine if each round is disabled (all matches are pending)
    return rounds.map(round => {
        const roundMatches = props.matches.filter(m => m.roundId === round.id)
        const isDisabled = roundMatches.length > 0 && roundMatches.every(m => m.status === 'pending')
        return {
            ...round,
            isDisabled
        }
    })
})

// Active round management
const activeRoundId = ref<string>('')

// Initialize active round
onMounted(() => {
    if (bracketRounds.value.length > 0) {
        const activeRound =
            bracketRounds.value.find((r) => r.roundIndex === props.currentRoundIndex) ||
            bracketRounds.value[0]
        if (activeRound) {
            activeRoundId.value = activeRound.id
        }
    }
})

// Watch for rounds changes
watch(
    bracketRounds,
    (newRounds) => {
        if (newRounds.length > 0 && !activeRoundId.value) {
            activeRoundId.value = newRounds[0]!.id
        }
    },
    { immediate: true }
)

// Helper to group matches by nextMatchId
const groupMatches = (matches: BracketMatch[]) => {
    const groups: Record<string, BracketMatch[]> = {}
    const singles: BracketMatch[] = []

    matches.forEach(match => {
        if (match.nextMatchId) {
            if (!groups[match.nextMatchId]) {
                groups[match.nextMatchId] = []
            }
            groups[match.nextMatchId]!.push(match)
        } else {
            singles.push(match)
        }
    })

    // Combine groups and singles, sorted by match number
    return [
        ...Object.values(groups).sort((a, b) => a[0]!.matchNumber - b[0]!.matchNumber),
        ...singles.map(m => [m])
    ]
}

// Filter matches by selected round (Grouped for connectors)
const groupedVisibleMatches = computed(() => {
    const matches = props.matches.filter((match) => match.roundId === activeRoundId.value)
    return groupMatches(matches)
})

// Previous round matches (Grouped for connectors)
const groupedPrevMatches = computed(() => {
    const activeRound = bracketRounds.value.find(r => r.id === activeRoundId.value)
    if (!activeRound || activeRound.roundIndex === 0) return []

    // Find round with index - 1
    const prevRound = bracketRounds.value.find(r => r.roundIndex === activeRound.roundIndex - 1)
    if (!prevRound) return []

    const matches = props.matches.filter((match) => match.roundId === prevRound.id)
    return groupMatches(matches)
})

// Next round matches (Flat list is fine for destination, but consistent structure helps)
const nextMatches = computed(() => {
    const activeRound = bracketRounds.value.find(r => r.id === activeRoundId.value)
    if (!activeRound) return []

    // Find round with index + 1
    const nextRound = bracketRounds.value.find(r => r.roundIndex === activeRound.roundIndex + 1)
    if (!nextRound) return []

    return props.matches.filter((match) => match.roundId === nextRound.id)
})

// Navigation guard
const tryGoToRound = (roundId: string) => {
    const targetRound = bracketRounds.value.find(r => r.id === roundId)
    if (targetRound && !targetRound.isDisabled) {
        activeRoundId.value = roundId
    }
}
</script>

<template>
    <div class="clip-corner-lg bg-surface-dark border border-white/5 shadow-2xl overflow-hidden relative">
        <!-- Header -->
        <div
            class="p-6 border-b border-white/5 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-6 bg-black/20">
            <h2 class="font-display font-bold text-xl text-white flex items-center gap-3">
                <span
                    class="w-8 h-8 rounded flex items-center justify-center bg-cyber-red/10 text-cyber-red border border-cyber-red/20">
                    <ListTree class="w-4 h-4" />
                </span>
                Tournament Pairs
            </h2>

            <!-- Round Navigation -->
            <BracketRoundNav v-if="bracketRounds.length > 0" :rounds="bracketRounds" :active-round-id="activeRoundId"
                @update:active-round-id="activeRoundId = $event" />
        </div>

        <!-- Bracket Grid -->
        <div class="p-6 lg:p-10 relative bg-cyber-darker/50 min-h-[600px] overflow-x-auto">
            <!-- Background pattern -->
            <div class="absolute inset-0 bg-cyber-dark/90" />



            <div class="relative z-10 flex gap-16 min-w-max xl:min-w-0 xl:justify-center">

                <!-- Previous Round (Grouped) -->
                <div v-if="groupedPrevMatches.length > 0"
                    class="hidden xl:flex flex-col justify-around gap-12 w-80 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <div v-for="(group, idx) in groupedPrevMatches" :key="`prev-group-${idx}`"
                        class="relative flex flex-col gap-4">
                        <!-- Matches -->
                        <BracketMatchCard v-for="match in group" :key="match.id" :match="match" :show-connector="false"
                            class="transition-all relative z-20"
                            :class="bracketRounds.find(r => r.id === match.roundId)?.isDisabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:scale-105'"
                            :title="bracketRounds.find(r => r.id === match.roundId)?.isDisabled ? 'Round Locked' : 'View Round'"
                            @click="tryGoToRound(match.roundId)" />

                        <!-- Bracket Connector (Only if it's a pair/group) -->
                        <div v-if="group.length > 1"
                            class="absolute -right-8 top-10 bottom-10 w-8 border-y-2 border-r-2 border-cyber-cyan/30 rounded-r-none z-[-1]" />
                        <!-- Horizontal Tail -->
                        <div v-if="group.length > 1"
                            class="absolute -right-16 top-1/2 w-8 h-[2px] bg-cyber-cyan/30 z-[-1]" />
                        <!-- Single Connector -->
                        <div v-else class="absolute -right-16 top-1/2 w-16 h-[2px] bg-cyber-cyan/30 z-[-1]" />
                    </div>
                </div>

                <!-- Active Round (Grouped) -->
                <div class="flex flex-col justify-around gap-12 w-80">
                    <div v-if="groupedVisibleMatches.length === 0" class="text-center text-gray-500 py-12">
                        No matches
                    </div>
                    <div v-else v-for="(group, idx) in groupedVisibleMatches" :key="`active-group-${idx}`"
                        class="relative flex flex-col gap-4">
                        <BracketMatchCard v-for="match in group" :key="match.id" :match="match"
                            :is-active="match.status === 'in_progress'" :show-connector="false"
                            class="shadow-[0_0_30px_rgba(0,0,0,0.5)] transform scale-105 transition-transform relative z-20" />

                        <!-- Bracket Connector (Only if it's a pair/group AND sending to next round) -->
                        <div v-if="group.length > 1 && nextMatches.length > 0"
                            class="hidden xl:block absolute -right-8 top-10 bottom-10 w-8 border-y-2 border-r-2 border-cyber-cyan/30 rounded-r-none z-[-1]" />
                        <!-- Horizontal Tail -->
                        <div v-if="group.length > 1 && nextMatches.length > 0"
                            class="hidden xl:block absolute -right-16 top-1/2 w-8 h-[2px] bg-cyber-cyan/30 z-[-1]" />
                        <!-- Single Connector -->
                        <div v-else-if="nextMatches.length > 0"
                            class="hidden xl:block absolute -right-16 top-1/2 w-16 h-[2px] bg-cyber-cyan/30 z-[-1]" />
                    </div>
                </div>

                <!-- Next Round -->
                <div v-if="nextMatches.length > 0"
                    class="hidden xl:flex flex-col justify-around gap-12 w-80 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <BracketMatchCard v-for="match in nextMatches" :key="match.id" :match="match"
                        :show-connector="false" class="transition-all relative z-20"
                        :class="bracketRounds.find(r => r.id === match.roundId)?.isDisabled ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer hover:scale-105'"
                        :title="bracketRounds.find(r => r.id === match.roundId)?.isDisabled ? 'Round Locked' : 'View Round'"
                        @click="tryGoToRound(match.roundId)" />
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
.clip-corner-lg {
    clip-path: polygon(24px 0,
            100% 0,
            100% calc(100% - 24px),
            calc(100% - 24px) 100%,
            0 100%,
            0 24px);
}
</style>
