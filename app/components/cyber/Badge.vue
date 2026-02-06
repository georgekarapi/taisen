<script setup lang="ts">
defineProps<{
    variant?: 'live' | 'upcoming' | 'ended' | 'default'
    label?: string
}>()
</script>

<template>
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold tracking-[0.2em] uppercase border shadow-sm backdrop-blur-sm"
        :class="[
            variant === 'live' ? 'bg-primary/10 border-primary/20 text-primary shadow-[0_0_10px_rgba(239,68,68,0.2)]' : '',
            variant === 'upcoming' ? 'bg-secondary/10 border-secondary/20 text-secondary shadow-[0_0_10px_rgba(6,182,212,0.2)]' : '',
            variant === 'ended' ? 'bg-slate-800/50 border-white/10 text-slate-500' : ''
        ]">
        <span v-if="variant === 'live'"
            class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_#EF4444]"></span>
        <span v-if="variant === 'upcoming'" class="w-1.5 h-1.5 rounded-full bg-secondary"></span>

        <slot>{{ label || variant }}</slot>
    </div>
</template>
