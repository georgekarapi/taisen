<script setup lang="ts">
import { Users, Trophy, PieChart, Timer, Search, Filter, MoreVertical, Play, Pause, XCircle, AlertTriangle } from 'lucide-vue-next'

const stats = [
    { title: 'Participants', value: '42/64', icon: Users, color: 'secondary' },
    { title: 'Prize Pool', value: '$10,000', icon: Trophy, color: 'primary' },
    { title: 'GM Fee (5%)', value: '$500', icon: PieChart, color: 'accent' }, // purple usually
    { title: 'Current State', value: 'ROUND 3', icon: Timer, color: 'success' }
]

const players = [
    { id: 8842, name: 'Neo_Glitch', archetype: 'Cyber-Samurai Aggro', record: '5 - 0', status: 'IN MATCH' },
    { id: 1120, name: 'Trinity_X', archetype: 'Void Control', record: '4 - 1', status: 'READY' },
    { id: 5591, name: 'Morpheus_Red', archetype: 'Matrix Reset', record: '2 - 3', status: 'ELIMINATED' },
    { id: '0001', name: 'Agent_Smith', archetype: 'Infinite Copy', record: '5 - 0', status: 'IN MATCH' }
]
</script>

<template>
    <div class="relative min-h-full p-6 lg:p-10 max-w-[1600px] mx-auto pb-20">
        <!-- Header -->
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
                <div class="flex items-center gap-2 text-xs font-body tracking-wider text-gray-500 mb-2 uppercase">
                    <NuxtLink to="/dashboard" class="hover:text-secondary cursor-pointer transition-colors">Tournaments
                    </NuxtLink>
                    <span>></span>
                    <span class="text-secondary">Cyberpunk Clash 2077</span>
                    <span>></span>
                    <span class="text-white bg-white/5 px-2 py-0.5 rounded">Manage</span>
                </div>
                <div class="flex items-center gap-4">
                    <h1
                        class="text-3xl lg:text-5xl font-display font-bold uppercase text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                        Cyberpunk Clash 2077
                    </h1>
                    <div
                        class="px-3 py-1 bg-primary/10 text-primary border border-primary/40 text-xs font-bold flex items-center gap-2 animate-pulse shadow-neon-red clip-corner-sm">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#ff003c]"></span> LIVE
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-4">
                <div class="px-4 py-2 bg-surface-dark border border-white/10 rounded font-mono text-sm text-gray-400">
                    <span class="text-gray-600 mr-2">ID:</span>#TRN-2077-X9
                </div>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <CyberPanel v-for="stat in stats" :key="stat.title" clip-class="clip-corner" hover-effect
                class="p-6 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <component :is="stat.icon" class="w-16 h-16" />
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-1 h-4 shadow-neon-blue"
                        :class="stat.color === 'primary' ? 'bg-primary' : stat.color === 'secondary' ? 'bg-secondary' : 'bg-green-500'">
                    </div>
                    <p class="text-gray-400 font-body text-xs uppercase tracking-[0.2em]">{{ stat.title }}</p>
                </div>
                <h3 class="text-4xl font-display font-bold text-white mt-4">{{ stat.value }}</h3>
            </CyberPanel>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Active Players Table -->
            <div class="flex-1 order-2 lg:order-1">
                <div class="clip-corner-lg bg-surface-dark border border-white/5 shadow-2xl overflow-hidden relative">
                    <div
                        class="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-black/20">
                        <h2 class="font-display font-bold text-xl text-white flex items-center gap-3">
                            <Users class="w-5 h-5 text-secondary" />
                            Active Players
                        </h2>
                        <div class="flex gap-2 w-full sm:w-auto">
                            <div class="relative flex-1 sm:flex-initial">
                                <input
                                    class="w-full sm:w-64 bg-black/50 border border-white/10 rounded-sm px-4 py-2 pl-8 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all font-mono"
                                    placeholder="Search ID or Alias..." type="text" />
                                <Search class="absolute left-2.5 top-2.5 w-4 h-4 text-gray-600" />
                            </div>
                            <button
                                class="px-3 py-2 rounded-sm bg-surface-light hover:bg-white/10 text-white border border-white/10 transition-colors">
                                <Filter class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead
                                class="bg-black/40 text-gray-500 font-body text-xs uppercase tracking-widest border-b border-white/5">
                                <tr>
                                    <th class="p-5 font-bold">Player</th>
                                    <th class="p-5 font-bold">Archetype</th>
                                    <th class="p-5 font-bold text-center">Record</th>
                                    <th class="p-5 font-bold">Status</th>
                                    <th class="p-5 font-bold text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5 text-sm">
                                <tr v-for="player in players" :key="player.id"
                                    class="group hover:bg-white/[0.02] transition-colors"
                                    :class="{ 'opacity-50 hover:opacity-100': player.status === 'ELIMINATED' }">
                                    <td class="p-5 flex items-center gap-4">
                                        <div
                                            class="w-10 h-10 rounded bg-gray-900 border border-secondary/50 overflow-hidden relative">
                                            <!-- Placeholder avatar -->
                                            <div class="w-full h-full bg-gray-800"></div>
                                        </div>
                                        <div>
                                            <div class="font-display font-bold text-white tracking-wide"
                                                :class="{ 'text-gray-400 line-through': player.status === 'ELIMINATED' }">
                                                {{ player.name }}</div>
                                            <div class="text-xs text-gray-600 font-mono">ID: {{ player.id }}</div>
                                        </div>
                                    </td>
                                    <td class="p-5 text-gray-400">{{ player.archetype }}</td>
                                    <td class="p-5 text-center font-mono"
                                        :class="player.status === 'ELIMINATED' ? 'text-gray-500' : 'text-secondary'">{{
                                            player.record }}</td>
                                    <td class="p-5">
                                        <span
                                            class="px-2 py-1 rounded-sm text-[10px] uppercase font-bold border tracking-wider"
                                            :class="player.status === 'ELIMINATED' ? 'bg-gray-800 text-gray-500 border-gray-700' : player.status === 'READY' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-green-500/10 text-green-500 border-green-500/20'">
                                            {{ player.status }}
                                        </span>
                                    </td>
                                    <td class="p-5 text-right">
                                        <MoreVertical
                                            class="w-4 h-4 ml-auto text-gray-600 cursor-pointer hover:text-white" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Admin Sidebar -->
            <div class="w-full lg:w-96 order-1 lg:order-2 flex flex-col gap-6">
                <div
                    class="clip-corner bg-black border border-primary/50 shadow-[0_0_20px_rgba(255,0,60,0.15)] p-6 relative">
                    <div
                        class="absolute -top-3 left-6 bg-black px-2 text-primary font-bold text-[10px] tracking-[0.3em] border border-primary/30 rounded uppercase">
                        Admin Control
                    </div>
                    <div class="space-y-6 mt-2">
                        <div>
                            <label
                                class="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Manual Winner Declaration
                                <span
                                    class="text-[10px] text-primary/70 border border-primary/30 px-1 rounded">R3</span>
                            </label>
                            <select
                                class="w-full bg-surface-dark border border-white/10 text-white py-3 px-4 rounded font-mono text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none cursor-pointer">
                                <option>Select Player ID...</option>
                                <option v-for="p in players" :key="p.id">{{ p.name }}</option>
                            </select>
                        </div>

                        <div
                            class="p-4 rounded border border-primary/30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,60,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]">
                            <div class="flex items-start gap-3 mb-4">
                                <AlertTriangle class="text-primary w-5 h-5" />
                                <div>
                                    <h4 class="text-primary font-bold text-sm uppercase">Irreversible Action</h4>
                                    <p class="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                        Smart contract #0x8F...3d2 will execute automated payouts upon confirmation.
                                    </p>
                                </div>
                            </div>
                            <CyberButton variant="primary" block>Distribute</CyberButton>
                        </div>

                        <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                            <button
                                class="py-3 border border-white/10 bg-surface-light hover:bg-white/10 text-gray-300 hover:text-white font-semibold rounded-sm uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2">
                                <Pause class="w-4 h-4" /> Pause
                            </button>
                            <button
                                class="py-3 border border-red-900/50 bg-red-900/10 hover:bg-red-900/20 text-red-500 font-semibold rounded-sm uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2">
                                <XCircle class="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.clip-corner-lg {
    clip-path: polygon(24px 0, 100% 0,
            100% calc(100% - 24px), calc(100% - 24px) 100%,
            0 100%, 0 24px);
}
</style>
