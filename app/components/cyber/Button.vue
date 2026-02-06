<script setup lang="ts">
defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    block?: boolean
}>()
</script>

<template>
    <button
        class="cyber-button relative font-display font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group"
        :class="[
            variant === 'primary' ? 'bg-cyber-red text-white hover:bg-red-600 shadow-neon-red' : '',
            variant === 'secondary' ? 'bg-cyber-cyan text-black hover:bg-cyan-400 shadow-neon-blue' : '',
            variant === 'outline' ? 'bg-transparent border border-white/20 text-white hover:border-white hover:bg-white/5' : '',
            variant === 'ghost' ? 'bg-transparent text-slate-400 hover:text-white' : '',
            block ? 'w-full py-4' : 'px-6 py-3',
            'clip-btn'
        ]">
        <!-- Glitch effect overlay for primary/secondary -->
        <div v-if="variant === 'primary' || variant === 'secondary'"
            class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 z-0" />

        <span class="relative z-10 flex items-center gap-2">
            <slot />
        </span>
    </button>
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
