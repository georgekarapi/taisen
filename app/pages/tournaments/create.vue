<script setup lang="ts">

const formData = ref({
    game: 'Cyberpunk Clash 2077 TCG',
    name: '',
    region: 'Global (Net)',
    launchTime: '',
    description: '',
    entryFee: 10,
    gmAllocation: 5
})

const totalCost = computed(() => {
    // 5.00 creation fee + 2% platform tax of something (assuming fixed for now) + gas
    // The mockup says 5.12 SUI. 
    return 5.12
})
</script>

<template>
    <div class="flex h-full relative z-10 w-full overflow-y-auto">
        <!-- Scanlines Effect -->
        <div class="fixed inset-0 pointer-events-none z-50 opacity-10"
            style="background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 50%); background-size: 100% 4px;">
        </div>

        <main class="w-full flex-1 p-6 lg:p-12 relative">
            <header
                class="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-6 relative">
                <div class="absolute bottom-[-1px] left-0 w-20 h-[2px] bg-secondary shadow-neon-blue"></div>
                <div>
                    <h5
                        class="text-secondary font-display text-xs tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
                        <span class="w-2 h-2 bg-secondary inline-block rounded-sm"></span>
                        Terminal // 0x4B
                    </h5>
                    <h1
                        class="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Create <span
                            class="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-white">Tournament</span>
                    </h1>
                </div>
                <div class="flex items-center gap-3 text-sm font-medium text-slate-400 mt-4 md:mt-0">
                    <span class="text-secondary font-display uppercase text-xs tracking-widest">Phase 1</span>
                    <div class="flex gap-1">
                        <div class="h-2 w-8 bg-secondary shadow-neon-blue skew-x-[-20deg]"></div>
                        <div class="h-2 w-8 bg-slate-800 skew-x-[-20deg]"></div>
                        <div class="h-2 w-8 bg-slate-800 skew-x-[-20deg]"></div>
                    </div>
                </div>
            </header>

            <form @submit.prevent class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">

                    <!-- Mission Intel Section -->
                    <CyberPanel variant="secondary" clip-class="cyber-clip-corner-top" class="p-8 group">
                        <div
                            class="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-secondary/30 rounded-tr-sm">
                        </div>
                        <div class="absolute bottom-0 left-0 w-4 h-4 bg-secondary/20"></div>

                        <h2
                            class="text-xl font-display font-bold text-white mb-8 flex items-center gap-3 border-b border-slate-800/50 pb-4">
                            <span class="material-icons text-secondary">grid_view</span>
                            <span class="tracking-widest uppercase">Mission Intel</span>
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="col-span-1 md:col-span-2">
                                <label
                                    class="block text-xs font-bold uppercase tracking-widest text-secondary mb-2 flex justify-between">
                                    Game Protocol <span class="text-[10px] text-slate-600">REQ*</span>
                                </label>
                                <div class="relative group/input">
                                    <select v-model="formData.game"
                                        class="w-full bg-black/60 border border-slate-700 text-slate-100 p-4 pl-4 pr-10 focus:border-secondary focus:ring-0 outline-none appearance-none font-medium transition-all font-display tracking-wide focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                        <option>Cyberpunk Clash 2077 TCG</option>
                                        <option>Magic: The Gathering (Neon Dynasty)</option>
                                        <option>Netrunner</option>
                                        <option>Yu-Gi-Oh! Master Duel</option>
                                    </select>
                                    <!-- Custom arrow would go here in full implementation -->
                                </div>
                            </div>

                            <div class="col-span-1 md:col-span-2">
                                <CyberInput v-model="formData.name" label="Operation Name"
                                    placeholder="e.g. NEON CITY SHOWDOWN" />
                            </div>

                            <div>
                                <label
                                    class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Region
                                    Coordinates</label>
                                <select v-model="formData.region"
                                    class="w-full bg-black/60 border border-slate-700 text-slate-100 p-4 focus:border-secondary outline-none appearance-none font-medium transition-all font-display">
                                    <option>Global (Net)</option>
                                    <option>NA - West Sector</option>
                                    <option>EU - Central Core</option>
                                    <option>APAC - Rim</option>
                                </select>
                            </div>

                            <div>
                                <CyberInput type="datetime-local" label="T-Minus Launch"
                                    v-model="formData.launchTime" />
                            </div>

                            <div class="col-span-1 md:col-span-2">
                                <label
                                    class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Briefing
                                    Data</label>
                                <textarea v-model="formData.description"
                                    class="w-full bg-black/60 border border-slate-700 text-slate-100 p-4 focus:border-secondary focus:ring-0 outline-none font-medium transition-all placeholder-slate-600 font-body"
                                    placeholder="Define engagement rules, prize pools, and operational constraints..."
                                    rows="4"></textarea>
                            </div>
                        </div>
                    </CyberPanel>

                    <!-- Fee Structure -->
                    <CyberPanel variant="primary" class="p-8 rounded-sm">
                        <h2
                            class="text-xl font-display font-bold text-white mb-8 flex items-center gap-3 border-b border-slate-800/50 pb-4">
                            <span class="material-icons text-secondary">account_balance_wallet</span>
                            <span class="tracking-widest uppercase">Fee Structure</span>
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Entry
                                    Fee (SUI)</label>
                                <div class="relative group">
                                    <input v-model="formData.entryFee"
                                        class="w-full bg-black/60 border border-primary/50 text-white p-4 pl-4 pr-12 focus:border-primary focus:ring-0 outline-none font-display font-bold text-lg transition-all shadow-[0_0_10px_rgba(255,42,109,0.1)] focus:shadow-[0_0_15px_rgba(255,42,109,0.2)]"
                                        min="0" type="number" />
                                    <span class="absolute right-4 top-4 text-xs font-bold text-primary pt-1">SUI</span>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-2 font-mono uppercase">>> Paid by participants
                                </p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">GM
                                    Allocation (%)</label>
                                <div class="relative">
                                    <input v-model="formData.gmAllocation"
                                        class="w-full bg-black/60 border border-slate-700 text-slate-100 p-4 pl-4 pr-12 focus:border-secondary focus:ring-0 outline-none font-display font-bold text-lg transition-all"
                                        max="100" min="0" type="number" />
                                    <span class="absolute right-4 top-4 text-xs font-bold text-slate-500 pt-1">%</span>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-2 font-mono uppercase">>> Organizer Cut</p>
                            </div>
                        </div>
                    </CyberPanel>
                </div>

                <!-- Sidebar -->
                <div class="lg:col-span-1">
                    <div class="sticky top-8">
                        <div
                            class="bg-surface-highlight/90 backdrop-blur border border-slate-700 p-1 clip-corner relative shadow-lg">
                            <div class="bg-black/40 p-6 clip-corner border border-white/5 h-full">
                                <div class="flex justify-between items-start mb-6 border-b border-slate-800 pb-4">
                                    <h3 class="text-lg font-display font-bold text-white uppercase tracking-wider">
                                        Cost Analysis
                                    </h3>
                                    <div class="flex gap-1 mt-1">
                                        <div class="w-1.5 h-1.5 bg-primary rounded-sm animate-pulse"></div>
                                        <div class="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                        <div class="w-1.5 h-1.5 bg-slate-800 rounded-sm"></div>
                                    </div>
                                </div>

                                <div class="space-y-5 mb-8 font-mono text-sm">
                                    <div class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Creation
                                            Fee</span>
                                        <span class="text-secondary">5.00 SUI</span>
                                    </div>
                                    <div class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Platform
                                            Tax (2%)</span>
                                        <span class="text-secondary">0.10 SUI</span>
                                    </div>
                                    <div class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Est.
                                            Gas</span>
                                        <span class="text-secondary opacity-70">~0.02 SUI</span>
                                    </div>
                                    <div
                                        class="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-4">
                                    </div>
                                    <div class="flex justify-between items-end">
                                        <span
                                            class="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total
                                            Payable</span>
                                        <div class="text-right">
                                            <span
                                                class="block text-4xl font-display font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{{
                                                    totalCost }}</span>
                                            <span class="text-xs font-bold text-slate-500">SUI</span>
                                        </div>
                                    </div>
                                </div>

                                <CyberButton variant="primary" block>
                                    Initialize Protocol
                                </CyberButton>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    </div>
</template>
