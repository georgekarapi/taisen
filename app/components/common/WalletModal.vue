<script setup lang="ts">
import { X, ChevronRight, ShieldCheck, User, Check, ChevronLeft, LogOut } from 'lucide-vue-next'
import { useWallet } from '~/composables/useWallet'
import type { Wallet } from '@wallet-standard/core'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const { getAvailableWallets, connect: connectStandard, isConnecting: isConnectingStandard, activeWallet, selectAccount, address: activeAddress, refresh, disconnect } = useWallet()

const isConnecting = computed(() => isConnectingStandard.value)

const wallets = computed(() => getAvailableWallets())
const selectedForAccounts = ref<Wallet | null>(null)

const handleConnect = async (wallet: Wallet) => {
    // If it's already connected and has multiple accounts, let user pick
    if (wallet.accounts.length > 1) {
        selectedForAccounts.value = wallet
        return
    }

    await connectStandard(wallet.name)
    if (!isConnectingStandard.value) {
        emit('close')
    }
}

const handleSelectAccount = (account: any) => {
    selectAccount(account)
    emit('close')
    selectedForAccounts.value = null
}

const handleDisconnect = async () => {
    await disconnect()
    emit('close')
    selectedForAccounts.value = null
}

const truncate = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`

// Reset state on close
watch(() => props.isOpen, (val) => {
    if (!val) selectedForAccounts.value = null
})

const handleOpenChange = (val: boolean) => {
    if (!val) emit('close')
}
</script>

<template>
    <Dialog :open="isOpen" @update:open="handleOpenChange">
        <DialogContent class="sm:max-w-md p-0 border-none bg-transparent shadow-none [&>button]:hidden">
            <div class="relative w-full overflow-hidden">
                <!-- Cyber Background with Gradients -->
                <div
                    class="absolute inset-0 bg-cyber-panel border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                </div>
                <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 pointer-events-none"></div>

                <!-- Content -->
                <div class="relative z-10 p-6">
                    <DialogHeader class="mb-4">
                        <DialogTitle class="sr-only">Connect Wallet</DialogTitle>
                        <DialogDescription class="sr-only">
                            Select a wallet to connect to the application
                        </DialogDescription>

                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <button v-if="selectedForAccounts" @click="selectedForAccounts = null"
                                    class="flex items-center gap-1 text-[10px] text-primary uppercase font-bold tracking-widest mb-2 hover:opacity-80 transition-opacity">
                                    <ChevronLeft class="w-3 h-3" /> Back
                                </button>
                                <h2
                                    class="text-xl font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck class="w-5 h-5 text-primary" />
                                    {{ selectedForAccounts ? 'Select Account' : 'Connect Wallet' }}
                                </h2>
                                <p class="text-xs text-white/40 mt-1 uppercase tracking-widest">
                                    {{ selectedForAccounts ? selectedForAccounts.name : 'Select your preferred uplink'
                                    }}
                                </p>
                            </div>
                            <button @click="$emit('close')"
                                class="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                                <X class="w-5 h-5" />
                            </button>
                        </div>
                    </DialogHeader>

                    <!-- Wallet List -->
                    <div v-if="!selectedForAccounts" class="space-y-3">
                        <button v-for="wallet in wallets" :key="wallet.name" @click="handleConnect(wallet)"
                            class="group relative w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">

                            <!-- Wallet Icon -->
                            <div
                                class="w-10 h-10 rounded-lg overflow-hidden bg-black/20 p-2 flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                                <img v-if="wallet.icon" :src="wallet.icon" :alt="wallet.name"
                                    class="w-full h-full object-contain" />
                                <div v-else
                                    class="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-[10px] text-white/40 font-mono">
                                    UI
                                </div>
                            </div>

                            <!-- Wallet Info -->
                            <div class="flex-1 text-left">
                                <div class="text-sm font-bold text-white tracking-wide">{{ wallet.name }}</div>
                                <div class="text-[10px] text-white/40 uppercase tracking-widest">
                                    {{ wallet.accounts.length > 0 ? `${wallet.accounts.length} Accounts Found` :
                                        'Browser Extension' }}
                                </div>
                            </div>

                            <!-- Arrow/Status -->
                            <div class="text-white/20 group-hover:text-primary transition-colors">
                                <ChevronRight class="w-4 h-4" />
                            </div>

                            <!-- Glow Effect on Hover -->
                            <div
                                class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl blur-xl">
                            </div>
                        </button>

                        <div v-if="wallets.length === 0"
                            class="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <div class="text-white/20 mb-2">No Uplinks Detected</div>
                            <div class="text-[10px] text-white/40 uppercase tracking-widest px-8">Please install a Sui
                                Wallet extension to proceed</div>
                        </div>
                    </div>

                    <!-- Account List (Switching) -->
                    <div v-else class="space-y-3 animate-in fade-in slide-in-from-right duration-300">
                        <button v-for="account in selectedForAccounts.accounts" :key="account.address"
                            @click="handleSelectAccount(account)"
                            class="group relative w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            :class="{ 'border-primary/50 bg-primary/5': activeAddress === account.address }">

                            <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <User class="w-4 h-4" />
                            </div>

                            <div class="flex-1 text-left">
                                <div class="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">{{ account.label
                                    || 'Account' }}</div>
                                <div class="text-xs font-mono text-white tracking-wider">{{ truncate(account.address) }}
                                </div>
                            </div>

                            <div v-if="activeAddress === account.address" class="text-primary">
                                <Check class="w-4 h-4" />
                            </div>
                        </button>
                    </div>


                    <!-- Disconnect Option -->
                    <div v-if="activeAddress" class="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                        <button @click="handleDisconnect"
                            class="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                            <LogOut class="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Disconnect Wallet
                        </button>

                        <div class="text-center">
                            <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                                Secured by Sui Wallet Standard Protocol
                            </p>
                        </div>
                    </div>

                    <!-- Footer Info (Only when not connected) -->
                    <div v-else class="mt-8 pt-6 border-t border-white/5 text-center">
                        <p class="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                            Secured by Sui Wallet Standard Protocol
                        </p>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>

<style scoped>
.slide-in-from-right {
    --tw-enter-translate-x: 20px;
    transform: translateX(20px);
}
</style>
