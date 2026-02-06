<script setup lang="ts">
import { Plus, Wallet, LogOut, Loader2 } from 'lucide-vue-next'
import { useWallet } from '~/composables/useWallet'
import WalletModal from './WalletModal.vue'

const { isConnected, truncatedAddress, isConnecting, error, disconnect } = useWallet()

const isModalOpen = ref(false)
</script>

<template>
    <div class="flex items-center gap-6">
        <!-- Wallet Connection -->
        <div class="flex items-center gap-3">
            <!-- Connected State -->
            <template v-if="isConnected">
                <div class="flex items-center gap-3">
                    <NuxtLink to="/tournaments/create">
                        <button
                            class="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded text-sm font-display uppercase tracking-wider transition-all">
                            <Plus class="w-4 h-4" />
                            Create
                        </button>
                    </NuxtLink>
                    <div class="h-6 w-px bg-white/10 mx-2"></div>
                    <div class="text-right hidden sm:block">
                        <div class="text-sm font-bold text-white leading-none tracking-wide font-mono">
                            {{ truncatedAddress }}
                        </div>
                        <button @click="isModalOpen = true"
                            class="text-[10px] text-primary hover:text-white font-mono mt-1 flex items-center gap-1 uppercase tracking-widest transition-colors">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Switch Account
                        </button>
                    </div>
                    <div
                        class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/20 flex items-center justify-center shadow-neon-blue">
                        <Wallet class="w-5 h-5 text-white" />
                    </div>
                    <button @click="disconnect"
                        class="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                        title="Disconnect">
                        <LogOut class="w-4 h-4" />
                    </button>
                </div>
            </template>

            <!-- Disconnected State -->
            <template v-else>
                <button @click="isModalOpen = true" :disabled="isConnecting"
                    class="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-sm font-display uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <Loader2 v-if="isConnecting" class="w-4 h-4 animate-spin" />
                    <Wallet v-else class="w-4 h-4" />
                    <span class="hidden sm:inline">{{ isConnecting ? 'Connecting...' : 'Connect' }}</span>
                </button>
            </template>
        </div>

        <!-- Wallet Selection Modal -->
        <ClientOnly>
            <WalletModal :is-open="isModalOpen" @close="isModalOpen = false" />
        </ClientOnly>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="text-xs text-red-400 max-w-32 truncate" :title="error">
        {{ error }}
    </div>
</template>
