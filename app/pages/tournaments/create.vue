<script setup lang="ts">
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import DateTimePicker from '@/components/ui/date-time-picker/DateTimePicker.vue'

const { games } = useGames()
const { isConnected } = useWallet()
const { createTournament, loading, error: txError } = useTournaments()
const router = useRouter()

const formData = ref({
    game: games[0]?.slug || '',
    name: '',
    isRemote: true,
    venueAddress: '',
    venueCity: '',
    venueCountry: '',
    launchTime: undefined as Date | undefined,
    description: '',
    entryFee: 10,
    gmAllocation: 5,
    sponsorAmount: 0
})

const CREATION_FEE = 0.1 // 0.1 SUI
const PLATFORM_TAX_BPS = 200 // 2%
const GAS_ESTIMATE = 0.02

const platformTax = computed(() => {
    return 0
})

const totalCost = computed(() => {
    return (CREATION_FEE + (formData.value.sponsorAmount || 0) + GAS_ESTIMATE).toFixed(2)
})

// Validation
const isGmAllocationValid = computed(() => {
    return formData.value.gmAllocation >= 0 && formData.value.gmAllocation <= 50
})

const isSponsorRequired = computed(() => {
    return formData.value.entryFee === 0 && (formData.value.sponsorAmount || 0) <= 0
})

const isVenueValid = computed(() => {
    if (formData.value.isRemote) return true
    return formData.value.venueCity.trim() !== '' && formData.value.venueCountry.trim() !== ''
})

const isValid = computed(() => {
    return formData.value.game &&
        formData.value.name &&
        formData.value.launchTime &&
        isGmAllocationValid.value &&
        !isSponsorRequired.value &&
        isVenueValid.value
})

const handleCreateTournament = async () => {
    if (!isValid.value) return

    const success = await createTournament({
        name: formData.value.name,
        gameType: formData.value.game,
        isRemote: formData.value.isRemote,
        venueAddress: formData.value.isRemote ? '' : formData.value.venueAddress,
        venueCity: formData.value.isRemote ? '' : formData.value.venueCity,
        venueCountry: formData.value.isRemote ? '' : formData.value.venueCountry,
        date: formData.value.launchTime!.getTime(),
        description: formData.value.description,
        entryFee: BigInt(Math.round(formData.value.entryFee * 1_000_000_000)),
        sponsorAmount: BigInt(Math.round((formData.value.sponsorAmount || 0) * 1_000_000_000)),
        gmFeeBps: formData.value.gmAllocation * 100,
    })

    if (success) {
        router.push('/')
    }
}
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
                    <h1
                        class="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Create Tournament
                    </h1>
                </div>
                <div class="flex items-center gap-3 text-sm font-medium text-slate-400 mt-4 md:mt-0">
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
                            <span class="tracking-widest uppercase">Details</span>
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    Select Game <span class="text-[10px] text-slate-600">REQ*</span>
                                </label>
                                <Select v-model="formData.game">
                                    <SelectTrigger class="w-full bg-black/60 border-slate-700 text-slate-100 h-12">
                                        <SelectValue placeholder="Select Game" />
                                    </SelectTrigger>
                                    <SelectContent class="bg-slate-950 border-slate-800">
                                        <SelectItem v-for="game in games" :key="game.slug" :value="game.slug"
                                            class="text-slate-100 focus:bg-slate-900 focus:text-white">
                                            {{ game.title }}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="col-span-1 md:col-span-2">
                                <CyberInput v-model="formData.name" label="Tournament Name"
                                    placeholder="e.g. Yu-Gi-Oh! Thessaloniki Open 2025" />
                            </div>

                            <div class="col-span-1 md:col-span-2">
                                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                    Tournament Type
                                </label>
                                <div class="flex gap-2">
                                    <button type="button"
                                        class="flex-1 h-12 font-display text-sm uppercase tracking-widest font-bold border-2 transition-all duration-300"
                                        :class="formData.isRemote
                                            ? 'border-white bg-slate-800/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                            : 'border-slate-800 bg-black/40 text-slate-500 hover:border-slate-700 hover:text-white'"
                                        @click="formData.isRemote = true">
                                        Online
                                    </button>
                                    <button type="button"
                                        class="flex-1 h-12 font-display text-sm uppercase tracking-widest font-bold border-2 transition-all duration-300"
                                        :class="!formData.isRemote
                                            ? 'border-white bg-slate-800/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                            : 'border-slate-800 bg-black/40 text-slate-500 hover:border-slate-700 hover:text-white'"
                                        @click="formData.isRemote = false">
                                        In-Person
                                    </button>
                                </div>
                            </div>

                            <template v-if="!formData.isRemote">
                                <div class="col-span-1 md:col-span-2">
                                    <CyberInput v-model="formData.venueAddress" label="Venue Address"
                                        placeholder="e.g. 123 Main Street" />
                                </div>
                                <div>
                                    <CyberInput v-model="formData.venueCity" label="City"
                                        placeholder="e.g. Thessaloniki"
                                        :class="{ 'border-red-500': !formData.isRemote && !formData.venueCity.trim() }" />
                                </div>
                                <div>
                                    <CyberInput v-model="formData.venueCountry" label="Country"
                                        placeholder="e.g. Greece"
                                        :class="{ 'border-red-500': !formData.isRemote && !formData.venueCountry.trim() }" />
                                </div>
                            </template>

                            <div>
                                <DateTimePicker v-model="formData.launchTime" label="Date & Time"
                                    placeholder="Select Date & Time" required />
                            </div>

                            <div class="col-span-1 md:col-span-2">
                                <CyberTextarea v-model="formData.description" label="Description"
                                    placeholder="Define engagement rules, prize pools, and operational constraints..." />
                            </div>
                        </div>
                    </CyberPanel>

                    <!-- Fee Structure -->
                    <CyberPanel variant="primary" class="p-8 rounded-sm">
                        <h2
                            class="text-xl font-display font-bold text-white mb-8 flex items-center gap-3 border-b border-slate-800/50 pb-4">
                            <span class="tracking-widest uppercase">Tournament Fee Structure</span>
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div>
                                <CyberInput v-model="formData.entryFee" label="Entry Fee" suffix="SUI" type="number"
                                    min="0" variant="primary" />
                                <p class="text-[10px] text-slate-500 mt-2 font-mono uppercase">>> Paid by participants
                                </p>
                            </div>
                            <div>
                                <CyberInput v-model="formData.sponsorAmount" label="Sponsor Contribution" suffix="SUI"
                                    type="number" min="0" variant="secondary"
                                    :class="{ 'border-red-500 shadow-neon-red': isSponsorRequired }" />
                                <p class="text-[10px] text-slate-500 mt-2 font-mono uppercase flex justify-between">
                                    <span>>> Added to prize pool</span>
                                    <span v-if="isSponsorRequired" class="text-red-500 animate-pulse">Required for free
                                        tournaments!</span>
                                </p>
                            </div>
                            <div>
                                <CyberInput v-model="formData.gmAllocation" label="GM Allocation" suffix="%"
                                    type="number" min="0" max="50" variant="primary"
                                    :class="{ 'border-red-500': !isGmAllocationValid }" />
                                <p class="text-[10px] text-slate-500 mt-2 font-mono uppercase flex justify-between">
                                    <span>>> Organizer Cut</span>
                                    <span :class="isGmAllocationValid ? 'text-slate-500' : 'text-red-500'">Max
                                        50%</span>
                                </p>
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
                                        <span class="text-secondary">{{ CREATION_FEE.toFixed(2) }} SUI</span>
                                    </div>
                                    <div v-if="formData.sponsorAmount > 0"
                                        class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Sponsor
                                            Contribution</span>
                                        <span class="text-secondary">{{ formData.sponsorAmount.toFixed(2) }} SUI</span>
                                    </div>
                                    <!-- Platform Tax isn't a direct creation cost, hiding for clarity or keeping as info if needed -->
                                    <!-- 
                                    <div class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Platform
                                            Tax (2%)</span>
                                        <span class="text-secondary">0.00 SUI</span>
                                    </div>
                                    -->
                                    <div class="flex justify-between items-center group">
                                        <span class="text-slate-400 group-hover:text-white transition-colors">Est.
                                            Gas</span>
                                        <span class="text-secondary opacity-70">~{{ GAS_ESTIMATE }} SUI</span>
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

                                <div v-if="!isConnected"
                                    class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono uppercase tracking-wider">
                                    <span class="text-red-500 mr-2">!</span>
                                    You must connect wallet to create a tournament
                                </div>

                                <div v-if="txError"
                                    class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 font-mono">
                                    {{ txError }}
                                </div>

                                <CyberButton variant="primary" block :disabled="!isValid || !isConnected || loading"
                                    @click="handleCreateTournament">
                                    {{ loading ? 'Creating...' : 'Create' }}
                                </CyberButton>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </main>
    </div>
</template>
