<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
    <div class="clip-corner-br flex min-h-[380px] flex-col p-[1px] bg-gradient-to-br from-cyber-cyan/20 to-transparent">
        <div class="clip-corner-br relative flex h-full flex-col overflow-hidden bg-cyber-dark">
            <!-- Image skeleton -->
            <Skeleton class="h-48 w-full rounded-none bg-cyber-panel" />

            <div class="flex flex-grow flex-col p-5">
                <!-- Title skeleton -->
                <Skeleton class="mb-3 h-6 w-3/4 bg-cyber-panel" />
                <Skeleton class="mb-3 h-6 w-1/2 bg-cyber-panel" />

                <!-- Stats skeleton -->
                <div class="mb-6 space-y-2">
                    <div class="flex justify-between border-b border-white/5 pb-1">
                        <Skeleton class="h-4 w-20 bg-cyber-panel" />
                        <Skeleton class="h-4 w-16 bg-cyber-panel" />
                    </div>
                    <div class="flex justify-between border-b border-white/5 pb-1">
                        <Skeleton class="h-4 w-14 bg-cyber-panel" />
                        <Skeleton class="h-4 w-12 bg-cyber-panel" />
                    </div>
                </div>

                <!-- Footer skeleton -->
                <div class="mt-auto flex items-center gap-2 border-t border-white/10 pt-4">
                    <Skeleton class="h-4 w-4 rounded-full bg-cyber-panel" />
                    <Skeleton class="h-4 w-32 bg-cyber-panel" />
                </div>
            </div>
        </div>
    </div>
</template>
