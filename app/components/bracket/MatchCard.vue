<script setup lang="ts">
import UserAvatar from '~/components/common/UserAvatar.vue'
/**
 * BracketMatchCard - Single match card displaying two players with scores
 * Uses cyber-arena styling with clip-path and neon effects
 */

const props = withDefaults(defineProps<{
    match: BracketMatch
    isActive?: boolean
    showConnector?: boolean
}>(), {
    isActive: false,
    showConnector: false
})

const playerOne = computed(() => props.match.players[0])
const playerTwo = computed(() => props.match.players[1])

const isInProgress = computed(() => props.match.status === 'in_progress')
const isCompleted = computed(() => props.match.status === 'completed')
</script>

<template>
    <div class="relative group">
        <!-- Horizontal connector line (visible on xl screens) -->
        <div v-if="showConnector"
            class="hidden xl:block absolute -right-8 top-1/2 w-8 h-[2px] bg-cyber-cyan/30 group-hover:bg-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all" />

        <div class="clip-bracket-card overflow-hidden relative transition-all" :class="[
            isInProgress || isActive
                ? 'bg-black/60 border border-cyber-cyan/50 hover:border-cyber-cyan'
                : 'bg-black/40 border border-white/5 hover:border-white/20',
            match.status === 'pending' ? 'opacity-60 hover:opacity-100' : ''
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
