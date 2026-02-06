<script setup lang="ts">
const props = withDefaults(defineProps<{
    modelValue?: string | number
    label?: string
    icon?: string
    required?: boolean
    options?: any[]
    variant?: 'primary' | 'secondary'
}>(), {
    variant: 'secondary'
})

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="cyber-select-group">
        <label v-if="label"
            class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex justify-between">
            {{ label }}
            <span v-if="required" class="text-[10px] text-slate-600">REQ*</span>
        </label>

        <div class="relative group">
            <span v-if="icon"
                class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-white transition-colors pointer-events-none">
                {{ icon }}
            </span>

            <select :value="modelValue"
                class="w-full bg-black/60 border text-slate-100 p-4 pr-10 focus:ring-0 outline-none appearance-none font-medium transition-all font-display tracking-wide"
                :class="[
                    icon ? 'pl-12' : 'pl-4',
                    variant === 'primary'
                        ? 'border-primary/50 focus:border-primary focus:shadow-[0_0_15px_rgba(255,42,109,0.2)]'
                        : 'border-slate-700 focus:border-secondary focus:shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                ]" @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
                <slot></slot>
            </select>

            <!-- Custom Arrow -->
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 transition-colors"
                :class="variant === 'primary' ? 'group-focus-within:text-primary' : 'group-focus-within:text-secondary'">
                <span class="material-icons">expand_more</span>
            </div>

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
