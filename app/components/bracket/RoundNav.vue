<script setup lang="ts">
/**
 * BracketRoundNav - Round navigation tabs
 * Mobile: horizontally scrollable
 * Desktop: fixed tabs with active glow effect
 */

const props = defineProps<{
    rounds: BracketRound[]
    activeRoundId: string
}>()

const emit = defineEmits<{
    'update:activeRoundId': [roundId: string]
}>()

function selectRound(roundId: string) {
    emit('update:activeRoundId', roundId)
}
</script>

<template>
    <div class="flex overflow-x-auto p-3 gap-1 scrollbar-hide -m-3">
        <button v-for="round in rounds" :key="round.id" :disabled="round.isDisabled"
            class="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap relative overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale-[0.5]"
            :class="round.id === activeRoundId
                ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_10px_rgba(0,240,255,0.25)] z-10'
                : round.isDisabled ? 'bg-white/5 text-gray-500 border border-transparent' : 'bg-white/5 text-gray-500 hover:text-white border border-transparent hover:border-white/10'
                " @click="selectRound(round.id)">
            <span class="relative z-10 flex items-center gap-2">
                {{ round.label }}
            </span>
            <div v-if="round.id === activeRoundId" class="absolute inset-0 bg-cyber-cyan/5 animate-pulse" />
        </button>
    </div>
</template>

<style scoped>
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
