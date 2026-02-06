<template>
    <div class="flex h-screen w-screen overflow-hidden bg-cyber-dark font-body text-white">
        <CommonSidebar />

        <main class="relative flex-1 overflow-y-auto p-8 lg:p-12">
            <div class="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <CommonBreadcrumbs />
                <CommonUserActions />
            </div>
            <slot />
        </main>
    </div>
</template>
