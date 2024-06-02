<template>
    <h1 class="text-lg">Favorites</h1>
    <Separator />
    <p class="my-4">You can add plans to your favorites by opening a saved plan and clicking the heart icon on top right
        corner.</p>

    <ul v-if="favorites.length > 0" class="flex flex-col gap-2">
        <li v-for="fav in favorites" :key="fav.id">
            <Button as-child>
                <NuxtLink :to="'/plan/' + fav.id">{{ fav.title }}</NuxtLink>
            </Button>
        </li>
    </ul>
    <Alert v-else>
        <AlertTitle class="flex items-center gap-2">
            You have added no favorites.
        </AlertTitle>
    </Alert>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'

const myPlansStore = useMyPlansStore();
const { favorites } = storeToRefs(myPlansStore)
</script>