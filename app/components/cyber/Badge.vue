<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { computed } from 'vue'

const props = defineProps<{
    variant?: 'live' | 'upcoming' | 'ended' | 'default'
    label?: string
}>()

const mappedVariant = computed(() => {
    // Map cyber variants to shadcn variants or 'outline'/'secondary' if appropriate
    // defaulting to 'default' (primary) usually.
    // 'live' is red -> 'destructive' or custom
    // 'upcoming' is cyan -> 'secondary' or custom
    // 'ended' -> 'secondary' or 'outline'
    switch (props.variant) {
        case 'live': return 'destructive' // Shadcn destructive is usually red
        case 'upcoming': return 'secondary' // Shadcn secondary is usually gray/slate, we need cyan.
        case 'ended': return 'outline'
        default: return 'default'
    }
})

const customClasses = computed(() => {
    // Current Cyber Badge implementation classes:
    // "inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold tracking-[0.2em] uppercase border shadow-sm backdrop-blur-sm"
    // Shadcn Badge already has base layout. We need to add font/tracking/uppercase/backdrop and specific colors.

    const classes = ['font-display font-bold tracking-[0.2em] uppercase backdrop-blur-sm']

    if (props.variant === 'live') {
        // 'bg-cyber-red/10 border-cyber-red/20 text-cyber-red shadow-[0_0_10px_rgba(255,0,60,0.2)]'
        classes.push('bg-cyber-red/10 border-cyber-red/20 text-cyber-red shadow-[0_0_10px_rgba(255,0,60,0.2)] hover:bg-cyber-red/20')
    } else if (props.variant === 'upcoming') {
        // 'bg-secondary/10 border-secondary/20 text-secondary shadow-[0_0_10px_rgba(6,182,212,0.2)]'
        // If we use shadcn secondary variant, it might override bg color. We might want to force it.
        classes.push('bg-cyber-cyan/10 border-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)] hover:bg-cyber-cyan/20')
    } else if (props.variant === 'ended') {
        // 'bg-slate-800/50 border-white/10 text-slate-500'
        classes.push('bg-slate-800/50 border-white/10 text-slate-500 hover:bg-slate-800/70')
    }

    return classes.join(' ')
})
</script>

<template>
    <Badge :variant="mappedVariant === 'secondary' ? 'outline' : mappedVariant" :class="customClasses" class="rounded">
        <span v-if="variant === 'live'"
            class="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse shadow-[0_0_5px_#ff003c] mr-2"></span>

        <slot>{{ label || variant }}</slot>
    </Badge>
</template>
