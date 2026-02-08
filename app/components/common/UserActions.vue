<script setup lang="ts">
import { Plus, Wallet, Loader2 } from 'lucide-vue-next'
import { useWallet } from '~/composables/useWallet'
import UserAvatar from './UserAvatar.vue'
import WalletModal from './WalletModal.vue'

const { isConnected, truncatedAddress, isConnecting, error, address: fullAddress, isAuthReady } = useWallet()

const isModalOpen = ref(false)
const isMounted = ref(false)

onMounted(() => {
    isMounted.value = true
})
</script>

<template>
    <div class="flex items-center gap-6 z-10">
        <div v-if="isMounted && isAuthReady" class="flex items-center gap-3">
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
                    <button @click="isModalOpen = true"
                        class="flex items-center gap-3 hover:opacity-80 transition-opacity group text-right">
                        <div class="hidden sm:block">
                            <div class="text-sm font-bold text-white leading-none tracking-wide font-mono">
                                {{ truncatedAddress }}
                            </div>
                            <div
                                class="text-[10px] text-primary group-hover:text-white font-mono mt-1 flex items-center justify-end gap-1 uppercase tracking-widest transition-colors">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                Switch Account
                            </div>
                        </div>
                        <UserAvatar :address="fullAddress" size="10"
                            class-name="shadow-neon-blue group-hover:border-primary/50 transition-colors" />
                    </button>
                </div>
            </template>

            <template v-else>
                <button @click="isModalOpen = true" :disabled="isConnecting"
                    class="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 hover:border-primary rounded-lg text-sm font-display uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <Loader2 v-if="isConnecting" class="w-4 h-4 animate-spin" />
                    <Wallet v-else class="w-4 h-4" />
                    <span class="hidden sm:inline">{{ isConnecting ? 'Connecting...' : 'Connect' }}</span>
                </button>
            </template>
        </div>

        <div v-else class="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />

        <div v-if="error" class="text-xs text-red-400 max-w-32 truncate" :title="error">
            {{ error }}
        </div>

        <Teleport to="body">
            <WalletModal v-if="isMounted" :is-open="isModalOpen" @close="isModalOpen = false" />
        </Teleport>
    </div>
</template>
