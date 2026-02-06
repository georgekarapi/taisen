<script setup lang="ts">
defineProps<{
    modelValue?: string | number
    type?: string
    placeholder?: string
    label?: string
    icon?: string
    required?: boolean
}>()

defineEmits(['update:modelValue'])
</script>

<template>
    <div class="cyber-input-group">
        <label v-if="label"
            class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex justify-between">
            {{ label }}
            <span v-if="required" class="text-[10px] text-slate-600">REQ*</span>
        </label>

        <div class="relative group">
            <span v-if="icon"
                class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-white transition-colors">
                {{ icon }}
            </span>

            <input :value="modelValue" :type="type || 'text'" :placeholder="placeholder"
                class="w-full bg-black/60 border border-slate-700 text-slate-100 p-4 focus:border-secondary focus:ring-0 outline-none font-medium transition-all placeholder-slate-600 font-display tracking-wide"
                :class="[icon ? 'pl-12' : 'pl-4']"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" />

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
input:focus {
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
}
</style>
