<script setup lang="ts">
import CyberButton from '@/components/cyber/Button.vue'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
    <section
        class="clip-corner-hero group relative mt-16 mb-12 h-[400px] w-full overflow-hidden border-b-2 border-r-2 border-cyber-panel">
        <!-- Background Image -->
        <div class="absolute inset-0 bg-cover bg-center"
            style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgAf44kPLXdojhW3qd9Hj24ZoE8c3sgbMpCiavhNnqtb_4qzUaHiLOkojt_tnYmIHozEcSj5mfiSr1DYcsLIv8ENRUavjyhA1p8RTSOyhBhwVF4qcy15aNKwvtO2kLtKH6MrsvGkWTtqpLO-ldWjy8VYNaB7rB9hgOTDzSRpYUNGtXJD-e-oZeiC3zxlB1uj7pV5pXskDimgpuW-FGh7UEnZQuB_Y1cpmu3KLHwDMXOd2q8TC07sE6WEwZPAukNqplh5nF_tnHZqg');">
            <div class="absolute inset-0 bg-gradient-to-r from-cyber-dark from-0% to-transparent to-60%" />
        </div>

        <!-- Content -->
        <div class="relative z-10 flex h-full max-w-3xl flex-col justify-center px-12">
            <h2 class="animate-pulse mb-2 font-display text-lg tracking-widest text-cyber-cyan uppercase opacity-80">
                Enter The Grid
            </h2>
            <h1
                class="mb-4 font-display text-6xl font-black uppercase leading-none tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Cyberpunk <br /> <span class="text-white">Clash 2077</span>
            </h1>
            <p class="mb-8 max-w-xl border-l-2 border-cyber-red pl-4 font-body text-lg text-gray-300">
                CYBERPUNK CLASH 2077 - ENTER THE GRID. BATTLE FOR SUPREMACY. THE FUTURE IS NOW.
            </p>

            <div>
                <CyberButton class="px-8 py-3">
                    REGISTER NOW
                    <ArrowRight
                        class="ml-2 inline-block h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </CyberButton>
            </div>
        </div>

        <!-- Decoration -->
        <div class="absolute right-4 top-4 flex space-x-2">
            <div class="h-2 w-2 animate-ping bg-cyber-red" />
            <div class="h-[2px] w-16 bg-cyber-red/50" />
        </div>

        <div class="absolute bottom-4 right-12 font-mono text-xs tracking-[0.2em] text-cyber-cyan/50">
            SYS.RDY // V.2.0.7.7
        </div>
    </section>
</template>
