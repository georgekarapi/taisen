<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    status: 'LIVE' | 'UPCOMING' | 'ENDED',
    color: string
}>()

</script>

<template>
    <div class="card-chip" :class="{ 'live-pulse': status === 'LIVE' }">
        <span v-if="status === 'LIVE'" class="dot">● </span>
        {{ status }}
    </div>
</template>

<style scoped>
.card-chip {
    --chip-color: v-bind('props.color');
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: 0.125rem;
    border: 1px solid var(--chip-color);
    background-color: color-mix(in srgb, var(--chip-color) 20%, transparent);
    color: var(--chip-color);
    backdrop-filter: blur(4px);
    text-transform: uppercase;
}

.live-pulse {
    background-color: var(--chip-color);
    color: white;
    box-shadow: 0 0 8px var(--chip-color);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot {
    font-size: 0.5rem;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        box-shadow: 0 0 8px var(--chip-color);
    }

    50% {
        opacity: 0.8;
        box-shadow: 0 0 15px var(--chip-color);
    }
}
</style>
