<script setup lang="ts">
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
    variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'live' | 'upcoming' | 'ended'
    hoverEffect?: boolean
    clipClass?: string
    noBorder?: boolean
    class?: string
    contentClass?: string
}>(), {
    variant: 'default',
    hoverEffect: false,
    clipClass: 'clip-corner-br',
    noBorder: false,
    class: '',
    contentClass: ''
})

const statusColorMap: Record<string, string> = {
    default: 'rgba(255, 255, 255, 0.1)',
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    accent: 'var(--color-accent)',
    live: 'var(--color-status-live)',
    upcoming: 'var(--color-status-upcoming)',
    ended: 'var(--color-status-ended)'
}

const statusColor = computed(() => statusColorMap[props.variant] || statusColorMap.default)

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'live': return 'live'
        case 'upcoming': return 'upcoming'
        case 'ended': return 'ended'
        default: return ''
    }
})
</script>

<template>
    <div class="cyber-card group relative p-px transition-all duration-300" :class="[
        variantClasses,
        clipClass,
        { 'hover:opacity-100': hoverEffect },
        props.class
    ]" :style="{ '--status-color': statusColor }">
        <Card :class="cn(
            'relative flex h-full w-full flex-col overflow-hidden bg-cyber-dark border-none rounded-none shadow-none',
            clipClass,
            contentClass
        )">
            <slot />
        </Card>
    </div>
</template>

<style scoped>
.cyber-card {
    /* Default fallback */
    --status-color: rgba(255, 255, 255, 0.1);
    background: linear-gradient(45deg, var(--status-color), transparent 40%, transparent 60%, var(--status-color));
}

.cyber-card.live {
    background: conic-gradient(from var(--angle), var(--status-color), transparent 20%, transparent 80%, var(--status-color));
    animation: spin 3s linear infinite;
}

/* Apply shadow only to LIVE and UPCOMING cards on hover if hoverEffect is roughly implied or explicit */
.cyber-card.live:hover,
.cyber-card.upcoming:hover {
    box-shadow: 0 0 5px var(--status-color), 0 0 10px var(--status-color);
}

@property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
}

@keyframes spin {
    from {
        --angle: 0deg;
    }

    to {
        --angle: 360deg;
    }
}
</style>
