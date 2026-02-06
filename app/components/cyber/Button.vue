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
        case 'outline': return 'outline'
        case 'ghost': return 'ghost'
        default: return 'default'
    }
})

// Custom classes to replicate the cyber look
const customClasses = computed(() => {
    const classes = ['transition-all duration-300 font-display font-bold uppercase tracking-wider clip-btn']

    if (props.variant === 'primary') {
        classes.push('bg-cyber-red text-white hover:bg-red-600 shadow-neon-red border-none hover:opacity-90')
    } else if (props.variant === 'secondary') {
        classes.push('bg-cyber-cyan text-black hover:bg-cyan-400 shadow-neon-blue border-none hover:opacity-90')
    } else if (props.variant === 'outline') {
        classes.push('border-white/20 text-white hover:border-white hover:bg-white/5')
    } else if (props.variant === 'ghost') {
        classes.push('text-slate-400 hover:text-white')
    }

    if (props.block) {
        classes.push('w-full py-4 h-auto')
    } else {
        classes.push('px-6 py-3 h-auto')
    }

    return classes.join(' ')
})
</script>

<template>
    <Button :variant="mappedVariant" :class="customClasses" class="cyber-button relative group overflow-hidden">
        <div v-if="variant === 'primary' || variant === 'secondary'"
            class="absolute inset-0 bg-white/20 translate-x-[-150%] group-hover:translate-x-[150%] opacity-0 group-hover:opacity-100 transition-all duration-500 skew-x-12 z-0" />

        <span class="relative z-10 flex items-center gap-2">
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
