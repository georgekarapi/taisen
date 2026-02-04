<script setup lang="ts">
import {
  Home,
  Trophy,
  Users,
  Gamepad2,
  Headset,
  Settings,
  Hexagon
} from 'lucide-vue-next'


const navItems = [
  { icon: Home, label: 'Home', active: true },
  { icon: Trophy, label: 'Tournaments' },
  { icon: Users, label: 'Community' },
  { icon: Gamepad2, label: 'Games' },
  { icon: Headset, label: 'Support' },
]
</script>

<template>
  <aside
    class="fixed left-0 top-0 h-screen w-24 bg-[#0B1120] border-r border-slate-800/50 flex flex-col items-center py-8 z-50">
    <!-- Logo -->
    <div class="mb-12 relative group cursor-pointer">
      <div class="absolute inset-0 bg-red-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <Hexagon class="w-10 h-10 text-red-500 fill-red-500/10" stroke-width="2.5" />
      <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0B1120]" />
    </div>

    <!-- Navigation -->
    <nav class="flex flex-col gap-6 flex-1 w-full items-center">
      <DashboardNavigationItem v-for="(item, index) in navItems" :key="index" :icon="item.icon" :active="item.active" />
    </nav>

    <!-- Bottom Actions -->
    <div class="mt-auto flex flex-col gap-6 w-full items-center">
      <DashboardNavigationItem :icon="Settings" />
    </div>
  </aside>
</template>
