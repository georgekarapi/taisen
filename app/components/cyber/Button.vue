<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
    variant?: 'outline' | 'ghost' | 'secondary' | 'link' | 'default' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
}

withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'default',
    asChild: false,
})
</script>

<template>
    <Button :variant="variant" :size="size" :class="[
        'btn-glitch relative overflow-hidden bg-transparent font-display font-bold tracking-wider text-white transition-colors duration-300 hover:bg-cyber-cyan/10',
        $attrs.class
    ]">
        <slot />
        <span
            class="absolute inset-0 z-[-1] border border-cyber-cyan shadow-[0_0_5px_#00f0ff] [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]" />
    </Button>
</template>
