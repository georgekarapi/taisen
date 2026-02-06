<script setup lang="ts">
import { Home, Calendar, Users, Trophy, Settings } from 'lucide-vue-next'
</script>

<template>
    <nav class="flex h-full w-20 flex-shrink-0 flex-col items-center border-r border-cyber-panel bg-cyber-panel z-20">
        <div class="mb-8 flex w-full justify-center py-6">
            <img alt="CyberArena Logo"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxQgILoV6ox8y1Ea_ZRigW-5Xn_2MzCl2JK9rJMMqFY5swMqd84_eOA-w46ND75UFp2aX55dbYJDCcjLfEb_JLk-GcIYGLck87EqKPHwgiZmsE2gz8uPM41_q_qyYhA4Vu3ZmgAv5s2E3ZpYkhgXWCzgr1YOBw_9GIT0GaXOZ2LtRIBR4mfaYE35Ej66FdeFBLaOU2WlRczBESWGxtH5H685QGpOqZQAZI3jQbhSPp8pK6RGm6_Q8F-6jWFoQRwD0gjfDFoT5t6jg"
                class="w-[50px] p-[5px] mix-blend-screen" />
        </div>

        <div class="flex w-full flex-col gap-6">
            <NuxtLink to="/" class="group flex h-14 w-full items-center justify-center transition-all duration-300"
                active-class="sidebar-active">
                <Home class="h-6 w-6" />
            </NuxtLink>

            <NuxtLink to="/analytics"
                class="flex h-14 w-full items-center justify-center text-white/40 transition-all duration-300 hover:text-white"
                active-class="sidebar-active">
                <Users class="h-6 w-6" />
            </NuxtLink>

            <a href="#"
                class="flex h-14 w-full items-center justify-center text-white/40 transition-all duration-300 hover:text-white">
                <Trophy class="h-6 w-6" />
            </a>

            <a href="#"
                class="flex h-14 w-full items-center justify-center text-white/40 transition-all duration-300 hover:text-white">
                <Calendar class="h-6 w-6" />
            </a>
        </div>

        <div class="mb-8 mt-auto flex w-full justify-center">
            <a href="#" class="text-white/40 transition-all duration-300 hover:text-white">
                <Settings class="h-6 w-6" />
            </a>
        </div>
    </nav>
</template>
