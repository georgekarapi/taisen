<script setup lang="ts">
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-cyber-dark font-body text-white">
    <CommonSidebar />

    <main class="relative flex-1 overflow-y-auto p-8">
      <div class="container mx-auto flex flex-col min-h-full">
        <div class="flex justify-end mb-6">
          <CommonUserActions />
        </div>
        <div class="flex-1">
          <slot />
        </div>
      </div>
    </main>
  </div>

</template>
