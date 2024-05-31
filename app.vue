<template>
  <AppHeader />
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
