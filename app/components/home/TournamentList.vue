<script setup lang="ts">
import { Trophy, Clock } from 'lucide-vue-next'

const tournaments = [
    {
        id: 1,
        title: 'Neon Circuit: Apex Legends',
        game: 'Apex Legends',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAszTWOax_9_ytYguAncFHhCMcb70NBRcRTtU5vtt2iUVFFjS-Y20J3tcV3Nx4JJfw47ijctDr1nnoNBYD0E9IMhRYbfrINfjGBIAwYiQl5MKoqyb4CIei0ZatG77fR9TayoeAtPwQITvtM9QBJf7RJ2mpfpRCyOp71lgWyyidubvUT-Hz1SG3VGT4nz2UOBDeK7S_DPUhvN5GEKSvD7ndeXZ6uLT3WgUhoImGfJXmp_N2PSr1Hye2Ml8gWi8t7s4-jeuNwuc7kNmE',
        status: 'LIVE',
        prizepool: '$10k',
        teams: '16/32',
        countdown: '20 countdown 30h',
        statusColor: 'cyber-red',
        iconColor: 'text-cyber-red'
    },
    {
        id: 2,
        title: 'Rift Protocol: League of Legends',
        game: 'League of Legends',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD15lY7CAFq84XkphSxppTSejk74cdDFDN4_Vj53n5qrYU5gHndYaPfhWhBkxGzCKrc5jwZxx_VTftRxP27ANFJexwEC3ljBh9AprI-uuy6C-Oc7ZvdgfyiV-WzyawIx18xPBgYZbAiM6kTv7R84gkrPHApfh1zO-yxXNjJPnjK3OO65Nh3JdlJwAfBol-EdpmUMG31TD-zBA6mqmBg0YFoAEkUI8OZ-cC13z6nq9XfxOWtfuXZXEPY58yS_nSXAMrmKYeZ_TCfhy0',
        status: 'UPCOMING',
        prizepool: '$10k',
        teams: '16/32',
        countdown: '8 countdown 54h',
        statusColor: 'cyber-cyan',
        iconColor: 'text-cyber-cyan'
    },
    {
        id: 3,
        title: 'Data Heist: Valorant',
        game: 'Valorant',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEujt0bS5eYMohEphwmj-MFJ6NNXPID1hlyz7UE55qn30ZYE2kpDBcx-hb2bsdq2tgdAbxUXURRGpbKBsBqWC_5BPMJ_7iHFjjNpB2ZBZoii6JBtZFAJPxioqTdEL3elNeaPyBlEYJpNBwFeK-HT_GgCNk_6r-27clrMZfSeqcoSTVe4oIZJ2ffwhHj9NSLs51gyjeODQ0Te_jU4dC6Lco7F3hJzNqkTCjJsJxdOGSZRrxzf5IzJsRldVwoyU0o09pEqAfNH6cS7E',
        status: 'ENDED',
        prizepool: '$10k',
        teams: '16/32',
        countdown: '27 days ago',
        statusColor: 'cyber-purple',
        iconColor: 'text-cyber-red' // Corrected from original HTML logic which seemed inconsistent, using red for ended as per icon
    },
    {
        id: 4,
        title: 'Synthwave Showdown: Rocket League',
        game: 'Rocket League',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3ri993NMoPvyiP8C_i_JlE4NKlGl907DolBIcTIbKj3nfL0Bg3KaCbiiVOgHwYQka9TwCt-DjoEhP5gCKUMM0ReLjRdDRxPFq211OjEU7u6fI8e4S0fRWqt8mQxOmzrIC-tNgqSg7QJ21gKZyT6RSP8Z80mgMnXIKw4CSt0FILqiTAJSGjPurhvtbbGXW7q5Trrxs6XTtgrsWmf8GRsAIbuCSQp-XH4N-FySUfrMV2ueApiDispj1GCIXbT1sqMIae-OTsP2F6dI',
        status: 'ENDED',
        prizepool: '$10k',
        teams: '16/32',
        countdown: '24 Jun, 2022',
        statusColor: 'cyber-purple',
        iconColor: 'text-gray-500'
    }
] as const
</script>

<template>
    <section>
        <div
            class="mb-8 flex flex-col items-end justify-between border-b border-white/10 pb-2 md:flex-row md:items-center">
            <h2 class="font-display text-3xl font-bold tracking-wide">
                TOURNAMENTS<span class="text-glow-red text-cyber-red">.</span>
            </h2>
            <div class="mt-4 flex gap-8 font-body text-lg md:mt-0">
                <button class="text-cyber-gray transition-colors hover:text-white">Upcoming</button>
                <button class="text-glow-red border-b-2 border-cyber-red pb-2 px-1 text-white">LIVE</button>
                <button class="text-cyber-gray transition-colors hover:text-white">Ended</button>
                <button class="text-cyber-gray transition-colors hover:text-white">All</button>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <CyberCard v-for="tournament in tournaments" :key="tournament.id" :tournament="tournament" />
        </div>
    </section>
</template>
