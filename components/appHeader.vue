<template>
    <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
            <div class="font-bold">
                <NuxtLink to="/">FFXIV mitigation planner</NuxtLink>
            </div>
            <div class="flex gap-2">
                <Preferences />
                <ThemeSelector />
            </div>
        </div>
    </header>
</template>