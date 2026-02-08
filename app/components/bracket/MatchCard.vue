<script setup lang="ts">
import { Trophy, Loader2, AlertTriangle } from 'lucide-vue-next'
import UserAvatar from '~/components/common/UserAvatar.vue'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
/**
 * BracketMatchCard - Single match card displaying two players with scores
 * Uses cyber-arena styling with clip-path and neon effects
 */

const props = withDefaults(defineProps<{
    match: BracketMatch
    isActive?: boolean
    isGm?: boolean
    tournamentId?: string
    canReport?: boolean
    showConnector?: boolean
}>(), {
    isActive: false,
    isGm: false,
    canReport: false,
    showConnector: true
})

const playerOne = computed(() => props.match.players[0])
const playerTwo = computed(() => props.match.players[1])

const isInProgress = computed(() => props.match.status === 'in_progress')
const isCompleted = computed(() => props.match.status === 'completed')
const canReportNow = computed(() => props.isGm && props.canReport && !isCompleted.value)
const isFinalMatch = computed(() => !props.match.nextMatchId)

const isPopoverOpen = ref(false)
const { reportMatchResult, loading: reporting } = useTournaments()

async function handleDeclareWinner(playerId: string) {
    if (!props.tournamentId) return
    await reportMatchResult(props.tournamentId, props.match.matchNumber, playerId)
    isPopoverOpen.value = false
}

</script>

<template>
    <div class="relative group" :class="isPopoverOpen ? 'z-100' : 'z-10'">
        <!-- Horizontal connector line (visible on xl screens) -->
        <div v-if="showConnector"
            class="hidden xl:block absolute -right-8 top-1/2 w-8 h-[2px] bg-cyber-cyan/30 group-hover:bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all" />

        <!-- GM Reporting Popover -->
        <Popover v-if="canReportNow" v-model:open="isPopoverOpen">
            <PopoverTrigger as-child>
                <div class="clip-bracket-card relative transition-all cursor-pointer hover:scale-[1.02] shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    :class="[
                        isInProgress || isActive
                            ? 'bg-black/60 border border-cyber-cyan/50 hover:border-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                            : 'bg-black/40 border border-white/5 hover:border-white/20'
                    ]">
                    <!-- Match number badge -->
                    <div class="absolute top-0 right-0 px-2 py-0.5 font-mono border-l border-b rounded-bl text-[10px]"
                        :class="isInProgress
                            ? 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20'
                            : 'bg-white/5 text-gray-400 border-white/10'
                            ">
                        MATCH #{{ match.matchNumber }}
                    </div>

                    <!-- Player 1 -->
                    <div class="flex items-center justify-between p-3 border-b border-white/5 transition-colors"
                        :class="playerOne?.status === 'winner' ? 'bg-cyber-cyan/5' : 'bg-white/2'">
                        <div v-if="playerOne" class="flex items-center gap-3">
                            <UserAvatar :address="playerOne.id" size="8" :class-name="[
                                playerOne.status === 'winner'
                                    ? 'border-cyber-cyan/50'
                                    : playerOne.status === 'loser'
                                        ? 'grayscale opacity-70'
                                        : ''
                            ]" />

                            <span class="text-sm tracking-wide" :class="playerOne.status === 'winner'
                                ? 'font-bold text-white'
                                : playerOne.status === 'loser'
                                    ? 'text-gray-400'
                                    : 'font-medium text-white'
                                ">
                                {{ playerOne.name }}
                            </span>
                        </div>
                        <div v-else class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded bg-gray-800 border border-white/10 flex items-center justify-center text-gray-600 text-[10px]">
                                TBD
                            </div>
                            <span class="text-sm font-medium text-gray-500">Pending</span>
                        </div>
                        <span class="font-mono font-bold text-lg" :class="playerOne?.status === 'winner'
                            ? 'text-cyber-cyan'
                            : playerOne?.status === 'loser'
                                ? 'text-gray-500'
                                : 'text-white'
                            ">
                            {{ playerOne ? playerOne.score : '-' }}
                        </span>
                    </div>

                    <!-- Player 2 -->
                    <div class="flex items-center justify-between p-3 relative transition-colors"
                        :class="playerTwo?.status === 'winner' ? 'bg-cyber-cyan/5' : ''">
                        <!-- Winner indicator bar -->
                        <div v-if="playerTwo?.status === 'winner'"
                            class="absolute left-0 top-0 bottom-0 w-0.5 bg-cyber-cyan shadow-[0_0_10px_#00f0ff]" />

                        <div v-if="playerTwo" class="flex items-center gap-3">
                            <UserAvatar :address="playerTwo.id" size="8" :class-name="[
                                playerTwo.status === 'winner'
                                    ? 'border-cyber-cyan/50'
                                    : playerTwo.status === 'loser'
                                        ? 'grayscale opacity-70'
                                        : ''
                            ]" />

                            <span class="text-sm tracking-wide" :class="playerTwo.status === 'winner'
                                ? 'font-bold text-white'
                                : playerTwo.status === 'loser'
                                    ? 'text-gray-400'
                                    : 'font-medium text-white'
                                ">
                                {{ playerTwo.name }}
                            </span>
                        </div>
                        <div v-else class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded bg-gray-800 border border-white/10 flex items-center justify-center text-gray-600 text-[10px]">
                                TBD
                            </div>
                            <span class="text-sm font-medium text-gray-500">Pending</span>
                        </div>
                        <span class="font-mono font-bold text-lg" :class="[
                            playerTwo?.status === 'winner'
                                ? 'text-cyber-cyan'
                                : playerTwo?.status === 'loser'
                                    ? 'text-gray-500'
                                    : 'text-white',
                            isInProgress && playerTwo ? 'animate-pulse' : ''
                        ]">
                            {{ playerTwo ? playerTwo.score : '-' }}
                        </span>
                    </div>

                    <!-- GM Quick Overlay Hint -->
                    <div
                        class="absolute inset-0 bg-cyber-cyan/5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div class="text-[10px] font-bold uppercase tracking-widest bg-black/80 px-3 py-1 border"
                            :class="isFinalMatch ? 'text-cyber-green border-cyber-green/20' : 'text-cyber-cyan border-cyber-cyan/20'">
                            {{ isFinalMatch ? 'Distribute Prize' : 'Declare Winner' }}
                        </div>
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent
                class="w-72 bg-surface-dark border-cyber-cyan/30 p-0 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)] z-9999">
                <div class="p-4 border-b border-white/5 bg-cyber-cyan/5"
                    :class="{ 'bg-cyber-green/10!': isFinalMatch }">
                    <h4
                        class="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <Trophy class="w-4 h-4" :class="isFinalMatch ? 'text-cyber-green' : 'text-cyber-cyan'" />
                        {{ isFinalMatch ? 'Distribute Prize' : 'Declare Winner' }}
                    </h4>
                </div>
                <div class="p-4 space-y-3">
                    <!-- Warning for final match -->
                    <div v-if="isFinalMatch"
                        class="p-3 mb-3 -mt-1 rounded bg-red-500/10 border border-red-500/20 flex gap-2">
                        <AlertTriangle class="w-4 h-4 text-red-500 shrink-0" />
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-red-400 uppercase tracking-wider">Irreversible Action
                            </p>
                            <p class="text-[10px] text-gray-400">Selecting a winner will immediately distribute the
                                prize
                                pool and close the tournament.</p>
                        </div>
                    </div>

                    <p v-else class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pick the winning
                        player
                    </p>

                    <button v-if="playerOne"
                        class="w-full p-3 rounded bg-white/5 border border-white/5 hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-all text-left flex items-center gap-3 group"
                        :disabled="reporting" @click="handleDeclareWinner(playerOne.id)">
                        <UserAvatar :address="playerOne.id" size="6" />
                        <span class="text-sm text-white font-medium group-hover:text-cyber-cyan transition-colors">{{
                            playerOne.name }}</span>
                    </button>

                    <button v-if="playerTwo"
                        class="w-full p-3 rounded bg-white/5 border border-white/5 hover:border-cyber-cyan/50 hover:bg-cyber-cyan/5 transition-all text-left flex items-center gap-3 group"
                        :disabled="reporting" @click="handleDeclareWinner(playerTwo.id)">
                        <UserAvatar :address="playerTwo.id" size="6" />
                        <span class="text-sm text-white font-medium group-hover:text-cyber-cyan transition-colors">{{
                            playerTwo.name }}</span>
                    </button>

                    <div v-if="reporting" class="flex items-center justify-center py-2">
                        <Loader2 class="w-5 h-5 text-cyber-cyan animate-spin" />
                    </div>
                </div>
            </PopoverContent>
        </Popover>

        <!-- Standard Display (No Popover) -->
        <div v-else class="clip-bracket-card overflow-hidden relative transition-all" :class="[
            isInProgress || isActive
                ? 'bg-black/60 border border-cyber-cyan/50 hover:border-cyber-cyan shadow-[0_0_20px_rgba(0,240,255,0.1)]'
                : 'bg-black/40 border border-white/5 hover:border-white/20',
            match.status === 'pending' ? 'opacity-60' : ''
        ]">
            <!-- Match number badge -->
            <div class="absolute top-0 right-0 px-2 py-0.5 font-mono border-l border-b rounded-bl text-[10px]" :class="isInProgress
                ? 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/20'
                : 'bg-white/5 text-gray-400 border-white/10'
                ">
                MATCH #{{ match.matchNumber }}
            </div>

            <!-- Player 1 -->
            <div class="flex items-center justify-between p-3 border-b border-white/5"
                :class="playerOne?.status === 'winner' ? 'bg-cyber-cyan/5' : 'bg-white/2'">
                <div v-if="playerOne" class="flex items-center gap-3">
                    <UserAvatar :address="playerOne.id" size="8" :class-name="[
                        playerOne.status === 'winner'
                            ? 'border-cyber-cyan/50'
                            : playerOne.status === 'loser'
                                ? 'grayscale opacity-70'
                                : ''
                    ]" />

                    <span class="text-sm tracking-wide" :class="playerOne.status === 'winner'
                        ? 'font-bold text-white'
                        : playerOne.status === 'loser'
                            ? 'text-gray-400'
                            : 'font-medium text-white'
                        ">
                        {{ playerOne.name }}
                    </span>
                </div>
                <div v-else class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded bg-gray-800 border border-white/10 flex items-center justify-center text-gray-600 text-[10px]">
                        TBD
                    </div>
                    <span class="text-sm font-medium text-gray-500">Pending</span>
                </div>
                <span class="font-mono font-bold text-lg" :class="playerOne?.status === 'winner'
                    ? 'text-cyber-cyan'
                    : playerOne?.status === 'loser'
                        ? 'text-gray-500'
                        : 'text-white'
                    ">
                    {{ playerOne ? playerOne.score : '-' }}
                </span>
            </div>

            <!-- Player 2 -->
            <div class="flex items-center justify-between p-3 relative"
                :class="playerTwo?.status === 'winner' ? 'bg-cyber-cyan/5' : ''">
                <!-- Winner indicator bar -->
                <div v-if="playerTwo?.status === 'winner'"
                    class="absolute left-0 top-0 bottom-0 w-0.5 bg-cyber-cyan shadow-[0_0_10px_#00f0ff]" />

                <div v-if="playerTwo" class="flex items-center gap-3">
                    <UserAvatar :address="playerTwo.id" size="8" :class-name="[
                        playerTwo.status === 'winner'
                            ? 'border-cyber-cyan/50'
                            : playerTwo.status === 'loser'
                                ? 'grayscale opacity-70'
                                : ''
                    ]" />

                    <span class="text-sm tracking-wide" :class="playerTwo.status === 'winner'
                        ? 'font-bold text-white'
                        : playerTwo.status === 'loser'
                            ? 'text-gray-400'
                            : 'font-medium text-white'
                        ">
                        {{ playerTwo.name }}
                    </span>
                </div>
                <div v-else class="flex items-center gap-3">
                    <div
                        class="w-8 h-8 rounded bg-gray-800 border border-white/10 flex items-center justify-center text-gray-600 text-[10px]">
                        TBD
                    </div>
                    <span class="text-sm font-medium text-gray-500">Pending</span>
                </div>
                <span class="font-mono font-bold text-lg" :class="[
                    playerTwo?.status === 'winner'
                        ? 'text-cyber-cyan'
                        : playerTwo?.status === 'loser'
                            ? 'text-gray-500'
                            : 'text-white',
                    isInProgress && playerTwo ? 'animate-pulse' : ''
                ]">
                    {{ playerTwo ? playerTwo.score : '-' }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.clip-bracket-card {
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
</style>
