<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const props = withDefaults(defineProps<{
    modelValue?: string
    placeholder?: string
    label?: string
    required?: boolean
    rows?: number | string
    variant?: 'primary' | 'secondary'
}>(), {
    variant: 'secondary'
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="cyber-textarea-group">
        <Label v-if="label"
            class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex justify-between">
            {{ label }}
            <span v-if="required" class="text-[10px] text-slate-600">REQ*</span>
        </Label>

        <div class="relative group">
            <Textarea :model-value="modelValue" :placeholder="placeholder" :rows="rows || 4"
                class="bg-black/60 text-slate-100 p-4 font-medium transition-all placeholder:text-slate-600 font-body resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                :class="[
                    variant === 'primary'
                        ? 'border-primary/50 focus:border-primary focus:shadow-[0_0_15px_rgba(255,42,109,0.2)]'
                        : 'border-slate-700 focus:border-secondary focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                ]" @update:model-value="$emit('update:modelValue', $event)" />

            <!-- Corner Accents -->
            <div class="absolute bottom-0 left-0 w-2 h-2 border-b border-l opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                :class="variant === 'primary' ? 'border-primary' : 'border-secondary'">
            </div>
            <div class="absolute top-0 right-0 w-2 h-2 border-t border-r opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"
                :class="variant === 'primary' ? 'border-primary' : 'border-secondary'">
            </div>
        </div>
    </div>
</template>
