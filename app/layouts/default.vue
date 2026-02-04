<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-red-500/30">
    <DashboardSidebar />
    <main class="pl-24 transition-all duration-300">
      <div class="container mx-auto p-8 max-w-7xl">
        <slot />
      </div>
    </main>
  </div>
</template>
