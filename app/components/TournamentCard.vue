<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

defineProps<{
    tournament: TournamentDisplay
}>()
</script>

<template>
    <NuxtLink :to="`/tournaments/${tournament.id}`"
        class="cyber-card cursor-pointer clip-corner-br group flex min-h-[380px] flex-col p-px transition-all duration-300"
        :class="[
            tournament.status.toLowerCase(),
            { 'opacity-90 hover:opacity-100': tournament.status === 'ENDED' }
        ]">
        <Card
            class="clip-corner-br relative flex h-full flex-col overflow-hidden bg-cyber-dark border-none rounded-none shadow-none">
            <div class="relative h-48 w-full overflow-hidden transition-all duration-500"
                :class="{ 'grayscale': tournament.status === 'ENDED' }">
                <NuxtImg :src="tournament.image" :alt="tournament.game"
                    class="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-100"
                    :class="{ 'opacity-60': tournament.status === 'ENDED' }" />
                <div class="absolute inset-0 bg-linear-to-t from-cyber-dark to-transparent" />

                <div class="absolute right-3 top-3">
                    <CyberChip :variant="tournament.status.toLowerCase() as any">{{ tournament.status }}</CyberChip>
                </div>
            </div>

            <div class="flex grow flex-col p-5">
                <h3
                    class="mb-3 font-display text-xl font-bold leading-tight transition-colors text-gray-300 group-hover:text-white">
                    <span v-html="tournament.title.replace(': ', ': <br/>')" />
                </h3>

                <div class="mb-6 space-y-2 font-mono text-sm text-gray-400"
                    :class="{ 'text-gray-500 group-hover:text-gray-400': tournament.status === 'ENDED' }">
                    <div class="flex justify-between border-b border-white/5 pb-1">
                        <span>Prizepool:</span>
                        <span :class="tournament.status === 'ENDED' ? 'text-gray-300' : 'text-white'">
                            {{ tournament.prizepool }}
                        </span>
                    </div>
                    <div class="flex justify-between border-b border-white/5 pb-1">
                        <span>Participants:</span>
                        <span :class="tournament.status === 'ENDED' ? 'text-gray-300' : 'text-white'">
                            {{ tournament.teams }}
                        </span>
                    </div>
                </div>

                <div class="mt-auto flex items-center gap-2 border-t border-white/10 pt-4">
                    <Trophy v-if="tournament.status !== 'ENDED'" class="h-4 w-4 trophy-icon" />
                    <span class="font-mono text-sm tracking-wide countdown-text">
                        {{ tournament.countdown }}
                    </span>
                </div>
            </div>
        </Card>

    </NuxtLink>

</template>

<style scoped>
.cyber-card {
    /* Default fallback */
    --status-color: var(--color-status-upcoming);
}

.cyber-card.live {
    --status-color: var(--color-status-live);
}

.cyber-card.upcoming {
    --status-color: var(--color-status-upcoming);
}

.cyber-card.ended {
    --status-color: var(--color-status-ended);
}

/* Base card border gradient using v-bind color */
.cyber-card {
    background: linear-gradient(45deg, var(--status-color), transparent 40%, transparent 60%, var(--status-color));
}

/* Live spinning border - using the common --angle property from main.css */
.cyber-card.live {
    background: conic-gradient(from var(--angle), var(--status-color), transparent 20%, transparent 80%, var(--status-color));
    animation: spin 3s linear infinite;
}

/* Apply shadow only to LIVE and UPCOMING cards on hover */
.cyber-card.live:hover,
.cyber-card.upcoming:hover {
    box-shadow: 0 0 5px var(--status-color), 0 0 10px var(--status-color);
}

.trophy-icon {
    color: var(--status-color);
}

.countdown-text {
    color: var(--status-color);
}

.cyber-card.ended .countdown-text {
    color: #6b7280;
    /* text-gray-500 */
}

/* Redeclare spin animation to ensure it works with local --angle if needed, 
   though the global one should suffice. */
@keyframes spin {
    from {
        --angle: 0deg;
    }

    to {
        --angle: 360deg;
    }
}
</style>
