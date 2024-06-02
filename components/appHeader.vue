<template>
    <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
            <div class="font-bold">
                <NuxtLink to="/">FFXIV mitigation planner</NuxtLink>
            </div>
            <div class="flex gap-2">

                <Button variant="ghost" as-child>
                    <NuxtLink :to="'/jobs'">Jobs & abilities</NuxtLink>
                </Button>
                <Button variant="ghost" as-child>
                    <NuxtLink :to="'/favorites'">Favorites</NuxtLink>
                </Button>

                <Preferences />
                <ThemeSelector />

                <!--
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="ghost">
                            <Icon icon="radix-icons:hamburger-menu" class="h-[1.2rem] w-[1.2rem]" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <NuxtLink :to="'/jobs'" class="flex gap-2 w-full">
                                <Icon icon="radix-icons:person" class="h-[1.2rem] w-[1.2rem]" /> Jobs & abilities
                            </NuxtLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <NuxtLink :to="'/favorites'" class="flex gap-2 w-full">
                                <Icon icon="radix-icons:heart" class="h-[1.2rem] w-[1.2rem]" /> Favorites
                            </NuxtLink>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <NuxtLink :to="'https://github.com/NikoLaasanen/ffxiv-mit-planner'" target="_blank"
                                class="flex gap-2 w-full">
                                <Icon icon="radix-icons:github-logo" class="h-[1.2rem] w-[1.2rem]" /> Github
                            </NuxtLink>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                -->
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
</script>