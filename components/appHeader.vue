<template>
    <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
        <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg">
                <img src="/logo_small.png" alt="Sword and shield logo" class="logo h-[2rem] w-[2rem] inline" />
                <span class="title">FFXIV mitigation planner</span>
            </NuxtLink>
            <div class="flex gap-2">
                <Button variant="ghost" as-child>
                    <NuxtLink :to="'/jobs'">
                        <div class="icon">
                            <Icon icon="radix-icons:component-1" class="h-[1.2rem] w-[1.2rem]" />
                        </div>
                        <div class="text">Jobs & abilities</div>
                    </NuxtLink>
                </Button>
                <Button variant="ghost" as-child>
                    <NuxtLink :to="'/favorites'">
                        <div class="icon">
                            <Icon icon="radix-icons:bookmark" class="h-[1.2rem] w-[1.2rem]" />
                        </div>
                        <div class="text">My plans</div>
                    </NuxtLink>
                </Button>

                <Preferences />
                <ThemeSelector />
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
</script>

<style scoped>
header {
    container-type: inline-size;
}

.title,
.text {
    display: none
}

@container (min-width: 700px) {
    .icon {
        display: none;
    }

    .title,
    .text {
        display: inline-block
    }
}
</style>