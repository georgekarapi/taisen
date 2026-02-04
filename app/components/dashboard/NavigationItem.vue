<script setup lang="ts">
import { cn } from '~/lib/utils'


const props = defineProps<{
  active?: boolean
  icon: any
  label?: string
}>()
</script>

<template>
  <Button variant="ghost" size="icon" :class="cn(
    'w-12 h-12 rounded-xl transition-all duration-300 relative group',
    active
      ? 'text-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'text-slate-400 hover:text-red-400 hover:bg-slate-800/50'
  )">
    <!-- Active Indicator Line -->
    <div v-if="active"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full shadow-[0_0_10px_#ef4444]" />

    <component :is="icon" class="w-6 h-6" />
  </Button>
</template>
