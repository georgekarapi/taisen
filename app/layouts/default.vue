<script setup lang="ts">
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-cyber-dark font-body text-white">
    <CommonSidebar />

    <main class="relative flex-1 overflow-y-auto p-8">
      <div class="absolute top-8 right-8 z-30 pointer-events-auto">
        <CommonUserActions />
      </div>
      <slot />
    </main>
  </div>

</template>
