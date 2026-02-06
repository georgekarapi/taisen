<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = withDefaults(defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    label?: string
    icon?: string
    required?: boolean
    suffix?: string
    variant?: 'primary' | 'secondary'
}>(), {
    variant: 'secondary'
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="cyber-input-group">
        <Label v-if="label"
            class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex justify-between">
            {{ label }}
            <span v-if="required" class="text-[10px] text-slate-600">REQ*</span>
        </Label>

        <div class="relative group">
            <span v-if="icon"
                class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-white transition-colors pointer-events-none z-10">
                {{ icon }}
            </span>

            <Input :model-value="modelValue" :type="type || 'text'" :placeholder="placeholder"
                class="bg-black/60 text-slate-100 p-4 h-auto font-medium transition-all placeholder:text-slate-600 font-display tracking-wide focus-visible:ring-0 focus-visible:ring-offset-0"
                :class="[
                    icon ? 'pl-12' : 'pl-4',
                    suffix ? 'pr-12' : 'pr-4',
                    variant === 'primary'
                        ? 'border-primary/50 focus:border-primary focus:shadow-[0_0_15px_rgba(255,42,109,0.2)]'
                        : 'border-slate-700 focus:border-secondary focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                ]" @update:model-value="$emit('update:modelValue', $event)" />

            <span v-if="suffix"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 pt-1 pointer-events-none">
                {{ suffix }}
            </span>

            <!-- Corner Accents -->
            <div
                class="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-secondary opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            </div>
            <div
                class="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Scoped styles removed as they are now handled by utility classes for variants */
</style>
