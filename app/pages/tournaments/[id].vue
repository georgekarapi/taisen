<script setup lang="ts">
import { Trophy, Shield, Zap, Users, Wallet } from 'lucide-vue-next'
import { useBreadcrumbs } from '~/composables/useBreadcrumbs'
import { useWallet } from '~/composables/useWallet'

definePageMeta({
    layout: 'content'
})

const route = useRoute()
const tournamentId = route.params.id
const { isConnected, truncatedAddress } = useWallet()

// Static data for mockup
const tournament = {
    title: 'Cyberpunk Clash 2077',
    game: 'Cyberpunk TCG',
    status: 'Registration Open',
    format: 'TCG • Standard Format v2.1',
    description: 'Enter the grid. Battle for supremacy in the ultimate high-stakes TCG showdown. Winner takes the DAO governance token.',
    timer: '04:12:45',
    prizePool: {
        total: '$15,400',
        entry: '100 USDC',
        sponsor: '5,000 USDC',
        fee: '2.5%'
    },
    requirements: [
        { label: 'Account Level', value: 'Minimum Level 20 required' },
        { label: 'Collection', value: 'Must own 1 "Legendary" Card' },
        { label: 'Rank', value: 'Ranked Gold III or higher' }
    ],
    participants: [
        { id: 1, name: '0x71C...9A2', title: 'Lvl 45 • Gladiator' },
        { id: 2, name: '0x3B2...1F4', title: 'Lvl 32 • Rogue' },
        { id: 3, name: '0xA91...77B', title: 'Lvl 60 • Master' }
    ]
}

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
    { label: 'Home', to: '/' },
    { label: tournament.game, to: '/' },
    { label: tournament.title }
])
</script>

<template>
    <div class="min-h-screen pb-40">
        <div class="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-0"></div>
        <div
            class="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none z-0">
        </div>

        <div>

            <!-- Hero -->
            <div
                class="flex flex-col xl:flex-row xl:items-end justify-between md:gap-56 gap-8 mb-12 border-b border-white/5 pb-8 relative">
                <div class="absolute bottom-0 left-0 w-32 h-px bg-gradient-to-r from-primary to-transparent"></div>

                <div class="relative">
                    <div class="flex items-center gap-4 mb-4">
                        <div
                            class="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                            <span
                                class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                            {{ tournament.status }}
                        </div>
                        <span
                            class="text-slate-500 font-display tracking-widest text-xs uppercase border-l border-white/10 pl-4">{{
                                tournament.format }}</span>
                    </div>

                    <h1
                        class="text-5xl lg:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none mb-4 drop-shadow-xl relative z-10">
                        Cyberpunk Clash 2077
                    </h1>

                    <p class="text-slate-400 max-w-2xl text-lg font-light border-l-2 border-primary/50 pl-4">
                        {{ tournament.description }}
                    </p>
                </div>

                <!-- Timer Box -->
                <div
                    class="flex flex-row xl:flex-col items-center xl:items-end gap-6 xl:gap-2 bg-surface-dark/50 p-4 rounded-lg border border-white/5">
                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Registration Ends In
                        </div>
                        <div
                            class="font-display text-3xl text-white font-bold tracking-widest tabular-nums text-glow-red font-mono">
                            {{ tournament.timer }}</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <!-- Left Sidebar Info -->
                <div class="lg:col-span-4 space-y-6">
                    <!-- Prize Pool Card -->
                    <CyberPanel clip-class="clip-corner-sm" class="overflow-hidden group">
                        <div class="absolute inset-0 bg-gradient-to-b from-accent-blue/5 to-transparent opacity-50">
                        </div>
                        <div
                            class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-accent-blue via-purple-500 to-transparent">
                        </div>
                        <div class="p-6 relative z-10">
                            <div class="flex items-center justify-between mb-8">
                                <h3
                                    class="font-display text-lg font-bold uppercase tracking-wider text-white flex items-center gap-2">
                                    <Trophy class="w-5 h-5 text-accent-blue" />
                                    Prize Pool
                                </h3>
                            </div>
                            <div class="space-y-5">
                                <div
                                    class="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-3">
                                    <span class="text-slate-400">Entry Fee</span>
                                    <span class="font-display font-bold text-white tracking-wide">{{
                                        tournament.prizePool.entry }}</span>
                                </div>
                                <div
                                    class="flex justify-between items-center text-sm border-b border-dashed border-white/10 pb-3">
                                    <span class="text-slate-400">Sponsor Contribution</span>
                                    <span class="font-display font-bold text-green-400">+ {{
                                        tournament.prizePool.sponsor }}</span>
                                </div>
                                <div class="mt-4 pt-4 bg-black/40 -mx-6 px-6 pb-6 mb-[-24px] border-t border-white/5">
                                    <div class="flex justify-between items-end">
                                        <span
                                            class="text-slate-500 uppercase text-[10px] tracking-widest font-bold mb-1">Total
                                            Pool Value</span>
                                        <span
                                            class="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{{
                                                tournament.prizePool.total }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CyberPanel>

                    <!-- Requirements -->
                    <div class="bg-surface-dark/50 border border-white/5 p-6 rounded-sm relative">
                        <div class="flex items-center gap-2 mb-6 text-slate-200">
                            <Shield class="w-5 h-5 text-slate-500" />
                            <h3 class="font-display text-base font-bold uppercase tracking-wider">Entry Requirements
                            </h3>
                        </div>
                        <ul class="space-y-4">
                            <li v-for="(req, idx) in tournament.requirements" :key="idx"
                                class="flex items-start gap-4 group">
                                <div
                                    class="w-5 h-5 rounded bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                                    <span class="text-primary text-xs">✓</span>
                                </div>
                                <div class="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                    <strong class="block text-slate-200 text-xs uppercase tracking-wide mb-0.5">{{
                                        req.label }}</strong>
                                    {{ req.value }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="lg:col-span-8">
                    <div class="bg-surface-dark border border-white/10 rounded-sm p-8 h-full relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent opacity-20 pointer-events-none"
                            style="clip-path: polygon(100% 0, 0 0, 100% 100%);"></div>
                        <div class="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                            <Zap class="w-6 h-6 text-accent-blue" />
                            <h3 class="font-display text-xl font-bold uppercase tracking-wider text-white">Tournament
                                Brief</h3>
                        </div>
                        <div class="prose prose-invert prose-lg max-w-none text-slate-400">
                            <p class="leading-relaxed">
                                Welcome to the <span class="text-white font-medium">Cyberpunk Clash 2077</span>. This is
                                a single-elimination tournament hosted on the CyberArena chain. Players will compete in
                                a best-of-3 format until the semi-finals, which will be best-of-5.
                            </p>
                            <!-- Using raw HTML for simplified brief content as per mockup text -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div>
                                    <h4
                                        class="font-display text-sm uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                        <span class="w-1 h-4 bg-primary"></span>
                                        Rules of Engagement
                                    </h4>
                                    <ul class="space-y-2 text-sm list-none pl-0">
                                        <li class="flex items-center gap-2"><span
                                                class="w-1 h-1 bg-slate-500 rounded-full"></span> Disconnections > 5
                                            mins = Loss</li>
                                        <li class="flex items-center gap-2"><span
                                                class="w-1 h-1 bg-slate-500 rounded-full"></span> Streaming delay: 3
                                            minutes</li>
                                    </ul>
                                </div>
                                <div class="bg-accent-blue/5 border border-accent-blue/10 p-4 rounded relative">
                                    <p class="text-sm font-medium italic text-slate-300 relative z-10 pl-4 pt-2">
                                        "Victory belongs to the most synchronized mind. Prepare your neural link."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Participants -->
            <div class="mb-24">
                <div class="flex items-center justify-between mb-8">
                    <h3
                        class="font-display text-xl font-bold uppercase tracking-wider text-white flex items-center gap-4">
                        <span class="w-2 h-8 bg-gradient-to-b from-primary to-purple-600 rounded-sm"></span>
                        Participants
                        <span
                            class="text-xs bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-sm font-body font-bold">12
                            / 32 REGISTERED</span>
                    </h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div v-for="user in tournament.participants" :key="user.id"
                        class="bg-[#0A0F1C] border border-white/5 p-4 rounded-sm flex items-center gap-4 hover:border-accent-blue/50 transition-all group cursor-pointer relative overflow-hidden">
                        <div
                            class="absolute inset-0 bg-accent-blue/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        </div>
                        <div class="relative w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                            <div class="w-full h-full bg-black rounded overflow-hidden">
                                <!-- Placeholder avatar -->
                                <div class="w-full h-full bg-gray-800"></div>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0 relative z-10">
                            <div class="text-sm font-bold text-white truncate font-display tracking-wide">{{ user.name
                            }}</div>
                            <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ user.title }}</div>
                        </div>
                    </div>
                    <!-- Open slot -->
                    <div
                        class="bg-black/20 border border-white/5 border-dashed p-4 rounded-sm flex items-center justify-center gap-3 opacity-60">
                        <span class="text-[10px] text-slate-500 font-display tracking-[0.2em] uppercase">Open
                            Slot</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer -->
        <div class="fixed bottom-0 left-0 lg:left-20 right-0 p-0 z-40 pointer-events-none flex justify-center">
            <div
                class="bg-[#0A0F1C]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,1)] w-full max-w-[1920px] py-6 px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
                <div class="flex items-center gap-5">
                    <div
                        class="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                        <Wallet class="w-5 h-5" />
                    </div>
                    <div>
                        <div class="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Connection Status
                        </div>
                        <div v-if="!isConnected"
                            class="text-white font-bold text-sm flex items-center gap-2 font-display tracking-wide">
                            Wallet Not Connected
                            <span class="relative flex h-2 w-2">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        </div>
                        <div v-else
                            class="text-white font-bold text-sm flex items-center gap-2 font-display tracking-wide">
                            <span class="text-green-400">{{ truncatedAddress }}</span>
                            <span class="relative flex h-2 w-2">
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                    <p class="text-xs text-slate-500 hidden md:block text-right">Registration requires 100 USDC + Gas
                    </p>
                    <CyberButton variant="primary" class="w-full md:w-auto pl-10 pr-8 py-4">
                        Register Now
                    </CyberButton>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.bg-grid-pattern {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
}
</style>
