<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    block?: boolean
}>(), {
    variant: 'primary',
    block: false
})

const mappedVariant = computed(() => {
    switch (props.variant) {
        case 'primary': return 'default'
        case 'secondary': return 'secondary' // or 'default' if we override color fully
        case 'outline': return 'ghost' // Use ghost to avoid default border, we handle border via padding/bg
        case 'ghost': return 'ghost'
        default: return 'default'
    }
})

// Custom classes to replicate the cyber look
const customClasses = computed(() => {
    const classes = ['transition-all duration-300 font-display font-bold uppercase tracking-wider clip-btn']

    if (props.variant === 'primary') {
        classes.push('bg-cyber-red text-white hover:bg-red-600 shadow-neon-red border-none hover:opacity-90 px-6 py-3 h-auto')
    } else if (props.variant === 'secondary') {
        classes.push('bg-cyber-cyan text-black hover:bg-cyan-400 shadow-neon-blue border-none hover:opacity-90 px-6 py-3 h-auto')
    } else if (props.variant === 'outline') {
        // Outline variant: padded container with bg-current acting as border content inside handles the rest
        classes.push('p-[1px] bg-white/20 hover:bg-white h-auto')
        // Note: text-color should be passed by parent or inherit
    } else if (props.variant === 'ghost') {
        classes.push('text-slate-400 hover:text-white px-6 py-3 h-auto')
    }

    if (props.block) {
        classes.push('w-full')
    }

    return classes.join(' ')
})
</script>

<template>
    <Button :variant="mappedVariant" :class="customClasses" class="cyber-button relative group overflow-hidden">
        <div v-if="variant === 'primary' || variant === 'secondary'"
            class="absolute inset-0 bg-white/20 translate-x-[-150%] group-hover:translate-x-[150%] opacity-0 group-hover:opacity-100 transition-all duration-500 skew-x-12 z-0" />

        <!-- Inner wrapper for outline variant to create border effect -->
        <div v-if="variant === 'outline'"
            class="w-full h-full bg-black clip-btn flex items-center justify-center relative z-10 box-border px-6 py-3 transition-colors duration-300 group-hover:bg-white/5">
            <span class="flex items-center gap-2">
                <slot />
            </span>
        </div>

        <span v-else class="relative z-10 flex items-center gap-2">
            <slot />
        </span>
    </Button>
</template>

<style scoped>
.clip-btn {
    clip-path: polygon(10px 0,
            100% 0,
            100% calc(100% - 10px),
            calc(100% - 10px) 100%,
            0 100%,
            0 10px);
}

.shadow-neon-red {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.shadow-neon-blue {
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
}
</style>
