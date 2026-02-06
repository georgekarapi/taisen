<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
</script>

<template>
    <div class="flex items-center gap-6">
        <NuxtLink to="/tournaments/create">
            <button
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded text-sm font-display uppercase tracking-wider transition-all">
                <Plus class="w-4 h-4" />
                Create
            </button>
        </NuxtLink>
        <div class="h-6 w-px bg-white/10"></div>
        <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
                <div class="text-sm font-bold text-white leading-none tracking-wide">NeonDrifter_99</div>
                <div class="text-[10px] text-secondary font-mono mt-1">Lvl 42 GM</div>
            </div>
            <div
                class="w-10 h-10 rounded-lg bg-gray-800 border border-white/20 overflow-hidden relative shadow-neon-blue">
                <img alt="User Avatar" class="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPVLN_OBA-FYTbrhIHRfYl16zx3tqjWXuv8IXbGCVih-DWjrGq-rw_QRlCDKbNHvl8IH-NYZqKbnz8K4KSUbkvp19heLbYgYwH4wEnxIzZp09ypQ3ieHaTmvnbvNYZqcTFwQx7jmKaMPWTy0A_sVYqjxaniIFBj0JoGsoPfsqi2ChdZ_FrPxZGknLNxt3QezG7awVNUq8vV9xdUiOCiBJp-oB63grnpDAIsAkTPa1DUD_eD5srov8g95t2Efo7NctDpjjpPUzK3Lw" />
            </div>
        </div>
    </div>
</template>
