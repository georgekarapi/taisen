<script setup lang="ts">
import CyberButton from '@/components/cyber/Button.vue'
import { ArrowRight, Calendar, Users, Trophy } from 'lucide-vue-next'

const { fetchAllTournaments, getDisplayTournaments } = useTournaments()

// State
const currentSlide = ref(0)
const loading = ref(true)
const autoplayInterval = ref<NodeJS.Timeout | null>(null)

// Computed
const tournaments = getDisplayTournaments()
const heroTournaments = computed(() => {
    return tournaments.value.slice(0, 3)
})

const currentTournament = computed(() => {
    if (heroTournaments.value.length === 0) return null
    return heroTournaments.value[currentSlide.value]
})

// Navigation
const nextSlide = () => {
    if (heroTournaments.value.length === 0) return
    currentSlide.value = (currentSlide.value + 1) % heroTournaments.value.length
}

const setSlide = (index: number) => {
    currentSlide.value = index
    resetAutoplay()
}

// Autoplay
const startAutoplay = () => {
    if (autoplayInterval.value) clearInterval(autoplayInterval.value)
    autoplayInterval.value = setInterval(nextSlide, 6000)
}

const stopAutoplay = () => {
    if (autoplayInterval.value) {
        clearInterval(autoplayInterval.value)
        autoplayInterval.value = null
    }
}

const resetAutoplay = () => {
    stopAutoplay()
    startAutoplay()
}

// Lifecycle
onMounted(async () => {
    loading.value = true
    try {
        await fetchAllTournaments()
    } finally {
        loading.value = false
        if (heroTournaments.value.length > 0) {
            startAutoplay()
        }
    }
})

onUnmounted(() => {
    stopAutoplay()
})
</script>

<template>
    <section
        class="clip-corner-hero group relative mb-12 h-[450px] w-full overflow-hidden border-b-2 border-r-2 border-cyber-panel transition-all duration-500"
        @mouseenter="stopAutoplay" @mouseleave="startAutoplay">

        <template v-if="loading">
            <div class="absolute inset-0 flex items-center justify-center bg-cyber-dark/50">
                <div class="h-12 w-12 animate-spin rounded-full border-4 border-cyber-cyan border-t-transparent"></div>
            </div>
        </template>

        <template v-else-if="currentTournament">
            <!-- Background Image -->
            <transition name="fade" mode="in-out">
                <div :key="currentTournament.id"
                    class="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
                    :style="{ backgroundImage: `url('${currentTournament.image}')` }">
                    <div
                        class="absolute inset-0 bg-linear-to-r from-cyber-dark from-10% via-cyber-dark/80 to-transparent to-70%" />
                    <div
                        class="absolute inset-0 bg-linear-to-t from-cyber-dark via-transparent to-transparent opacity-80" />
                </div>
            </transition>

            <!-- Content -->
            <div class="relative z-10 flex h-full max-w-4xl flex-col justify-center px-8 md:px-16">
                <!-- Status Badge -->
                <div class="mb-4 flex items-center space-x-3">
                    <span :class="[
                        'inline-flex items-center rounded-sm bg-black/50 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur-sm border',
                        currentTournament.status === 'LIVE' ? 'text-cyber-red border-cyber-red' :
                            currentTournament.status === 'UPCOMING' ? 'text-cyber-cyan border-cyber-cyan' : 'text-gray-400 border-gray-600'
                    ]">
                        <span v-if="currentTournament.status === 'LIVE'"
                            class="mr-2 h-2 w-2 animate-pulse rounded-full bg-cyber-red"></span>
                        {{ currentTournament.status }}
                    </span>
                    <span class="font-mono text-xs text-cyber-cyan/70 tracking-wider">
                        // {{ currentTournament.game }}
                    </span>
                </div>

                <transition name="slide-up" mode="out-in">
                    <div :key="currentTournament.id">
                        <h1
                            class="mb-2 font-display text-5xl md:text-6xl font-black uppercase leading-none tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            {{ currentTournament.title }}
                        </h1>

                        <div class="mb-6 mt-4 flex flex-wrap gap-6 text-sm font-medium text-gray-300">
                            <div class="flex items-center">
                                <Trophy class="mr-2 h-4 w-4 text-cyber-yellow" />
                                <span class="text-white">{{ currentTournament.prizepool }}</span>
                                <span class="ml-1 text-gray-500">PRIZE POOL</span>
                            </div>
                            <div class="flex items-center">
                                <Users class="mr-2 h-4 w-4 text-cyber-cyan" />
                                <span class="text-white">{{ currentTournament.teams }}</span>
                                <span class="ml-1 text-gray-500">TEAMS</span>
                            </div>
                            <div class="flex items-center">
                                <Calendar class="mr-2 h-4 w-4 text-cyber-purple" />
                                <span class="text-white">{{ new Date(currentTournament.date).toLocaleDateString()
                                    }}</span>
                            </div>
                        </div>

                        <p
                            class="mb-8 max-w-xl border-l-2 border-cyber-red/50 pl-4 font-body text-lg text-gray-300 line-clamp-2">
                            {{ currentTournament.description ||'Join the ultimate battle for supremacy. Complete in this tournament to win big prizes and glory.' }}
                        </p>

                        <div class="flex items-center gap-4">
                            <NuxtLink :to="`/tournaments/${currentTournament.id}`">
                                <CyberButton variant="primary"
                                    class="px-8 py-3 group-hover:shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                                    {{ currentTournament.status === 'LIVE' ? 'WATCH NOW' : 'REGISTER NOW' }}
                                    <ArrowRight
                                        class="ml-2 inline-block h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                                </CyberButton>
                            </NuxtLink>

                            <NuxtLink v-if="currentTournament.status === 'UPCOMING'"
                                :to="`/tournaments/${currentTournament.id}`" class="hidden sm:block">
                                <CyberButton variant="ghost" class="px-6 py-3">
                                    VIEW DETAILS
                                </CyberButton>
                            </NuxtLink>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- Carousel Navigation -->
            <div class="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-3"
                v-if="heroTournaments.length > 1">
                <button v-for="(_, index) in heroTournaments" :key="index" @click="setSlide(index)"
                    class="h-1 transition-all duration-300"
                    :class="index === currentSlide ? 'w-8 bg-cyber-cyan' : 'w-4 bg-gray-600 hover:bg-gray-400'"
                    :aria-label="`Go to slide ${index + 1}`">
                </button>
            </div>

            <!-- Decoration -->
            <div class="absolute right-4 top-4 flex space-x-2">
                <div class="h-2 w-2 animate-ping bg-cyber-red" />
                <div class="h-[2px] w-16 bg-cyber-red/50" />
            </div>

            <div class="absolute bottom-4 right-12 font-mono text-xs tracking-[0.2em] text-cyber-cyan/50">
                TAISEN // V.0.9.0
            </div>
        </template>

        <!-- Fallback if no tournaments -->
        <template v-else>
            <div class="absolute inset-0 bg-cover bg-center"
                style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCgAf44kPLXdojhW3qd9Hj24ZoE8c3sgbMpCiavhNnqtb_4qzUaHiLOkojt_tnYmIHozEcSj5mfiSr1DYcsLIv8ENRUavjyhA1p8RTSOyhBhwVF4qcy15aNKwvtO2kLtKH6MrsvGkWTtqpLO-ldWjy8VYNaB7rB9hgOTDzSRpYUNGtXJD-e-oZeiC3zxlB1uj7pV5pXskDimgpuW-FGh7UEnZQuB_Y1cpmu3KLHwDMXOd2q8TC07sE6WEwZPAukNqplh5nF_tnHZqg');">
                <div class="absolute inset-0 bg-linear-to-r from-cyber-dark from-0% to-transparent to-60%" />
            </div>

            <div class="relative z-10 flex h-full max-w-3xl flex-col justify-center px-12">
                <h2
                    class="animate-pulse mb-2 font-display text-lg tracking-widest text-cyber-cyan uppercase opacity-80">
                    Enter The Grid
                </h2>
                <h1
                    class="mb-4 font-display text-6xl font-black uppercase leading-none tracking-wide text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Cyberpunk <br /> <span class="text-white">Clash 2077</span>
                </h1>
                <p class="mb-8 max-w-xl border-l-2 border-cyber-red pl-4 font-body text-lg text-gray-300">
                    CYBERPUNK CLASH 2077 - ENTER THE GRID. BATTLE FOR SUPREMACY. THE FUTURE IS NOW.
                </p>
                <div>
                    <CyberButton variant="primary" class="px-8 py-3">
                        REGISTER NOW
                        <ArrowRight
                            class="ml-2 inline-block h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                    </CyberButton>
                </div>
            </div>
        </template>
    </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.5s ease-out;
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>
