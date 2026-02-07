<script setup lang="ts">
/**
 * UserAvatar - Atomic component to render dynamic DiceBear avatars based on address
 */
interface Props {
    address: string | null | undefined
    size?: string
    className?: string | string[] | Record<string, boolean>
}

const props = withDefaults(defineProps<Props>(), {
    size: '10',
    className: ''
})

const avatarUrl = computed(() => {
    if (!props.address) return null
    return `https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${props.address}`
})
</script>

<template>
    <div :class="[
        `w-${size} h-${size}`,
        'rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/20',
        className
    ]">
        <img v-if="avatarUrl" :src="avatarUrl" :alt="address || 'User Avatar'" class="w-full h-full object-cover" />
        <div v-else class="w-1/2 h-1/2 rounded-full bg-white/10 animate-pulse"></div>
    </div>
</template>
