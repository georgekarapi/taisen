<script setup lang="ts">

interface Props {
  title: string
  game: string
  status: 'live' | 'upcoming' | 'ended'
  prizepool: string
  teams: string
  date: string
  image: string
}

const props = defineProps<Props>()

const statusStyles = {
  live: 'bg-red-600 text-white border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
  upcoming: 'bg-blue-600 text-white border border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
  ended: 'bg-slate-600/80 text-slate-200 border border-slate-500'
}

const dateColors = {
  live: 'text-red-400',
  upcoming: 'text-blue-400',
  ended: 'text-slate-400'
}
</script>

<template>
  <div
    class="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900 border border-slate-700/50 hover:border-blue-500/40 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-blue-500/10">

    <!-- Card Image -->
    <div class="relative h-40 overflow-hidden">
      <img :src="image" :alt="title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

      <!-- Status Badge -->
      <div
        class="absolute top-3 right-3 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
        :class="statusStyles[status]">
        <span v-if="status === 'live'" class="w-2 h-2 bg-white rounded-full animate-pulse" />
        {{ status }}
      </div>
    </div>

    <!-- Card Content -->
    <div class="p-4 space-y-3">
      <!-- Title & Game -->
      <div>
        <h3 class="font-bold text-white text-base leading-tight">{{ title }}:</h3>
        <p class="text-slate-300 text-sm">{{ game }}</p>
      </div>

      <!-- Prize & Teams -->
      <div class="space-y-1 text-sm">
        <p class="text-slate-400">
          Prizepool: <span class="text-white font-medium">{{ prizepool }}</span>
        </p>
        <p class="text-slate-400">
          Teams: <span class="text-white font-medium">{{ teams }}</span>
        </p>
      </div>

      <!-- Date -->
      <p class="text-sm font-medium" :class="dateColors[status]">
        {{ date }}
      </p>
    </div>
  </div>
</template>
