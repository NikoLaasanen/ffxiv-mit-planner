<template>
  <header class="sticky z-40 top-0 bg-background/80 backdrop-blur-lg border-b border-border">
    <div class="container flex h-14 max-w-screen-2xl items-center justify-between">
      <div class="font-bold">
        <NuxtLink to="/">FFXIV mitigation planner</NuxtLink>
      </div>
      <ThemeSelector />
    </div>
  </header>

  <main class="bg-background">
    <div class="container py-4">
      <NuxtPage />
    </div>
  </main>

  <Toaster />
</template>

<script lang="ts" setup>
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>
