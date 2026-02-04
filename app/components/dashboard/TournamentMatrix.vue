<script setup lang="ts">


const tournaments = [
  {
    id: 1,
    title: 'Neon Circuit',
    game: 'Apex Legends',
    status: 'live',
    prizepool: '$10,000',
    teams: '16/32',
    date: '20 countdown 30h',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Rift Protocol',
    game: 'League of Legends',
    status: 'upcoming',
    prizepool: '$10,000',
    teams: '16/32',
    date: '8 countdown 54h',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Data Heist',
    game: 'Valorant',
    status: 'ended',
    prizepool: '$10,000',
    teams: '16/32',
    date: '27 days ago',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    title: 'Synthwave Showdown',
    game: 'Rocket League',
    status: 'ended',
    prizepool: '$10,000',
    teams: '16/32',
    date: '24 Jun, 2022',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600'
  }
] as const
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold">
        <span class="text-white">TOURNAMENTS</span>
      </h2>
    </div>

    <Tabs default-value="all" class="w-full">
      <div class="flex justify-end -mt-12 mb-8">
        <TabsList class="bg-transparent border-b border-slate-800 rounded-none h-auto p-0 w-auto">
          <TabsTrigger value="upcoming"
            class="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 text-slate-400 px-6 py-2">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="live"
            class="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent data-[state=active]:text-red-500 text-slate-400 px-6 py-2">
            LIVE
          </TabsTrigger>
          <TabsTrigger value="ended"
            class="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-slate-300 text-slate-400 px-6 py-2">
            Ended
          </TabsTrigger>
          <TabsTrigger value="all"
            class="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-500 data-[state=active]:bg-transparent data-[state=active]:text-slate-300 text-slate-400 px-6 py-2">
            All
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" class="mt-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardTournamentCard v-for="tournament in tournaments" :key="tournament.id" v-bind="tournament" />
        </div>
      </TabsContent>

      <!-- Logic for other tabs would filter the list, simply showing all for 'all' tab demo -->
      <TabsContent value="live" class="mt-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardTournamentCard v-for="tournament in tournaments.filter(t => t.status === 'live')"
            :key="tournament.id" v-bind="tournament" />
        </div>
      </TabsContent>

      <TabsContent value="upcoming" class="mt-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardTournamentCard v-for="tournament in tournaments.filter(t => t.status === 'upcoming')"
            :key="tournament.id" v-bind="tournament" />
        </div>
      </TabsContent>

      <TabsContent value="ended" class="mt-0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardTournamentCard v-for="tournament in tournaments.filter(t => t.status === 'ended')"
            :key="tournament.id" v-bind="tournament" />
        </div>
      </TabsContent>

    </Tabs>
  </div>
</template>
