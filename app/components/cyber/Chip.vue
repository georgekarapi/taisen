<script setup lang="ts">
import Badge from './Badge.vue'

defineProps<{
    variant?: 'live' | 'upcoming' | 'ended' | 'default'
    label?: string
}>()
</script>

<template>
    <Badge :variant="variant" :label="label">
        <slot />
    </Badge>
</template>
