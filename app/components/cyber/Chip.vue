<script setup lang="ts">
const props = withDefaults(defineProps<{
    variant?: 'live' | 'upcoming' | 'ended' | 'default'
    label?: string
}>(), {
    variant: 'default'
})
</script>

<template>
    <div class="card-chip" :class="{
        'text-status-live border-status-live bg-status-live/10 live-pulse': variant === 'live',
        'text-status-upcoming border-status-upcoming bg-status-upcoming/20': variant === 'upcoming' || variant === 'default',
        'text-status-ended border-status-ended bg-status-ended/20': variant === 'ended'
    }">
        <span v-if="variant === 'live'" class="dot">● </span>
        <slot>{{ label }}</slot>
    </div>
</template>

<style scoped>
.card-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    border-radius: 0.125rem;
    border-width: 1px;
    border-style: solid;
    backdrop-filter: blur(4px);
    text-transform: uppercase;
}

.live-pulse {
    /* Shadow using the exact color for neon effect */
    box-shadow: 0 0 8px theme('colors.status.live');
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.dot {
    font-size: 0.5rem;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
        box-shadow: 0 0 8px theme('colors.status.live');
    }

    50% {
        opacity: 0.8;
        box-shadow: 0 0 15px theme('colors.status.live');
    }
}
</style>
