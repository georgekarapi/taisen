<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    variant?: 'primary' | 'secondary' | 'accent' | 'default'
    hoverEffect?: boolean
    clipClass?: string
    noBorder?: boolean
}>(), {
    variant: 'default',
    hoverEffect: false,
    clipClass: 'clip-corner',
    noBorder: false
})

const borderColor = computed(() => {
    switch (props.variant) {
        case 'primary': return 'var(--color-primary, #EF4444)'
        case 'secondary': return 'var(--color-secondary, #06B6D4)'
        case 'accent': return 'var(--color-accent, #3B82F6)'
        default: return 'rgba(255, 255, 255, 0.1)'
    }
})
</script>

<template>
    <div class="relative bg-surface-dark group" :class="[
        clipClass,
        { 'transition-all duration-300': hoverEffect },
        { 'hover:border-opacity-50 hover:shadow-[0_0_20px_rgba(var(--glow-rgb),0.2)]': hoverEffect }
    ]">
        <!-- Border/Glow Container -->
        <div v-if="!noBorder" class="absolute inset-0 pointer-events-none p-[1px]" :class="clipClass"
            :style="{ background: `linear-gradient(45deg, ${borderColor}, transparent 40%, transparent 60%, ${borderColor})` }">
            <div class="h-full w-full bg-surface-dark opacity-90" :class="clipClass"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 h-full w-full">
            <slot />
        </div>
    </div>
</template>
