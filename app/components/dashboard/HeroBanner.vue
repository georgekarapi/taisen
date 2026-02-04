<script setup lang="ts">


// Using the provided image that was uploaded or a placeholder
const heroImage = '/images/hero.png'
</script>

<template>
  <div class="relative w-full h-[400px] rounded-2xl overflow-hidden group border border-slate-800">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop"
        alt="Cyberpunk Clash"
        class="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
    </div>

    <!-- Content -->
    <div class="relative h-full flex flex-col justify-center px-12 z-10 max-w-2xl">
      <div class="flex items-center gap-3 mb-4">
        <!-- Glitch effect decoration -->
        <div class="w-12 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
        <span class="text-blue-400 font-bold tracking-wider text-sm uppercase">CyberArena Tournament</span>
      </div>

      <h1 class="text-5xl font-black text-white mb-4 leading-tight tracking-tight">
        CYBERPUNK <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">CLASH 2077</span>
      </h1>

      <p class="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
        Join the ultimate battle for supremacy in the neon-soaked streets.
        Compete with the best players worldwide and claim your glory.
      </p>

      <div class="flex items-center gap-4">
        <Button size="lg"
          class="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-0 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          REGISTER NOW
        </Button>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-0 right-0 p-4">
      <div class="flex gap-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75" />
        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
      </div>
    </div>
  </div>
</template>
