<script setup lang="ts">
import { Trophy, Clock, Loader2 } from 'lucide-vue-next'

const { fetchAllTournaments, getDisplayTournaments, loading, error } = useTournaments()

// Filter state
const activeFilter = ref<'all' | 'LIVE' | 'UPCOMING' | 'ENDED'>('all')

// Fetch tournaments on mount
onMounted(async () => {
    await fetchAllTournaments()
})

// Get display tournaments
const displayTournaments = getDisplayTournaments()

// Filtered tournaments based on active filter
const filteredTournaments = computed(() => {
    if (activeFilter.value === 'all') {
        return displayTournaments.value
    }
    return displayTournaments.value.filter(t => t.status === activeFilter.value)
})
</script>

<template>
    <section>
        <div
            class="mb-8 flex flex-col items-end justify-between border-b border-white/10 pb-2 md:flex-row md:items-center">
            <h2 class="font-display text-3xl font-bold tracking-wide">
                TOURNAMENTS<span class="text-glow-red text-cyber-red">.</span>
            </h2>
            <div class="mt-4 flex gap-8 font-body text-lg md:mt-0">
                <button @click="activeFilter = 'UPCOMING'"
                    :class="activeFilter === 'UPCOMING' ? 'text-glow-red border-b-2 border-cyber-cyan pb-2 px-1 text-white' : 'text-cyber-gray transition-colors hover:text-white'">
                    Upcoming
                </button>
                <button @click="activeFilter = 'LIVE'"
                    :class="activeFilter === 'LIVE' ? 'text-glow-red border-b-2 border-cyber-red pb-2 px-1 text-white' : 'text-cyber-gray transition-colors hover:text-white'">
                    LIVE
                </button>
                <button @click="activeFilter = 'ENDED'"
                    :class="activeFilter === 'ENDED' ? 'text-glow-red border-b-2 border-cyber-purple pb-2 px-1 text-white' : 'text-cyber-gray transition-colors hover:text-white'">
                    Ended
                </button>
                <button @click="activeFilter = 'all'"
                    :class="activeFilter === 'all' ? 'text-glow-red border-b-2 border-white pb-2 px-1 text-white' : 'text-cyber-gray transition-colors hover:text-white'">
                    All
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <Loader2 class="w-8 h-8 text-primary animate-spin" />
            <span class="ml-3 text-slate-400 font-display uppercase tracking-wider">Loading tournaments...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
            <div class="text-red-400 font-display uppercase tracking-wider mb-2">Error loading tournaments</div>
            <div class="text-slate-500 text-sm">{{ error }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTournaments.length === 0" class="text-center py-20">
            <div class="text-slate-400 font-display uppercase tracking-wider">No tournaments found</div>
            <div class="text-slate-500 text-sm mt-2">
                {{ activeFilter === 'all' ? 'No tournaments available yet' : `No ${activeFilter.toLowerCase()}
                tournaments` }}
            </div>
        </div>

        <!-- Tournament Grid -->
        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <CyberCard v-for="tournament in filteredTournaments" :key="tournament.id" :tournament="tournament" />
        </div>
    </section>
</template>
