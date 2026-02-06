<script setup lang="ts">
import { useBreadcrumbs } from '~/composables/useBreadcrumbs'

const { breadcrumbs } = useBreadcrumbs()
</script>

<template>
    <div v-if="breadcrumbs.length > 0"
        class="flex items-center space-x-2 text-xs text-slate-500 font-display tracking-widest uppercase mb-4 md:mb-0">
        <template v-for="(item, index) in breadcrumbs" :key="index">
            <span v-if="index > 0">></span>
            <NuxtLink v-if="item.to && index < breadcrumbs.length - 1" :to="item.to"
                class="hover:text-primary transition-colors cursor-pointer">
                {{ item.label }}
            </NuxtLink>
            <span v-else :class="{ 'text-accent-blue': index === breadcrumbs.length - 1 }">
                {{ item.label }}
            </span>
        </template>
    </div>
</template>
