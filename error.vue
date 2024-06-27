<template>
    <div v-if="error" class="h-lvh grid place-content-center">
        <div class="flex items-center gap-6">
            <img class="aspect-square" src="https://xivapi.com/i/002000/002914_hr1.png" alt="Rabbit Medium icon" />
            <h2 class="text-8xl">{{ error.statusCode }}</h2>
        </div>
        <p class="text-center">{{ error.message }}</p>
    </div>
</template>

<script lang="ts" setup>
import type { NuxtError } from '#app'

defineProps({
    error: Object as () => NuxtError
})
</script>