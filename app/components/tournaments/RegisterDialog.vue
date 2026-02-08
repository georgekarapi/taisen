<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
    modelValue: boolean
    loading?: boolean
    entryFee?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'confirm', username: string): void
}>()

const isOpen = useVModel(props, 'modelValue', emit)
const username = ref('')

function handleConfirm() {
    if (!username.value.trim()) return
    emit('confirm', username.value)
    // Don't close immediately, let the parent handle loading state and closing
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-md border-white/10 bg-[#0A0F1C] text-white">
            <DialogHeader>
                <DialogTitle class="text-white font-display tracking-wide">Tournament Registration</DialogTitle>
                <DialogDescription class="text-slate-400">
                    Enter your username to participate in this tournament.
                </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
                <div class="space-y-2">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
                    <CyberInput v-model="username" placeholder="Enter your username" auto-focus />
                </div>

                <div v-if="entryFee"
                    class="bg-surface-dark/50 border border-white/5 p-3 rounded flex justify-between items-center text-sm">
                    <span class="text-slate-400">Entry Fee</span>
                    <span class="font-display font-bold text-white">{{ entryFee }}</span>
                </div>
            </div>
            <DialogFooter class="sm:justify-between flex-row items-center gap-4">
                <CyberButton variant="ghost" @click="isOpen = false" :disabled="loading">
                    Cancel
                </CyberButton>
                <CyberButton variant="primary" @click="handleConfirm" :disabled="!username.trim() || loading">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                    {{ loading ? 'Confirming...' : 'Confirm Registration' }}
                </CyberButton>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
