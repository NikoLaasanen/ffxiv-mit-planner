<template>
    <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
            <div class="font-bold">
                <NuxtLink to="/">FFXIV mitigation planner</NuxtLink>
            </div>
            <div class="flex gap-2">
                <Button variant="ghost" as-child>
                    <NuxtLink :to="'/jobs'">Jobs</NuxtLink>
                </Button>
                <Preferences />
                <ThemeSelector />
                <!-- 
                    <Button variant="ghost" as-child>
                        <NuxtLink :to="'https://github.com/NikoLaasanen/ffxiv-mit-planner'" target="_blank">
                            <Icon icon="radix-icons:github-logo" class="h-[1.2rem] w-[1.2rem]" />
                            <span class="sr-only">Github</span>
                        </NuxtLink>
                    </Button>
                -->
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
</script>