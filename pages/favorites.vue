<template>
    <h1 class="text-lg mb-6">My plans</h1>
    <div class="flex flex-col gap-6">
        <div>
            <h2 class="text-lg">Favorites</h2>
            <Separator />
            <p class="text-muted-foreground my-2">You can add plans to your favorites by opening a saved plan and
                clicking the heart icon on
                top right
                corner.</p>

            <ul v-if="favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li v-for="fav in favoritesSorted" :key="fav.id" class="flex gap-1">
                    <Button class="grow" as-child>
                        <NuxtLink :to="'/plan/' + fav.id">{{ fav.title }}</NuxtLink>
                    </Button>
                    <Button variant="outline" @click="myPlansStore.toggleFavorite(fav.id, fav.title)">
                        <Icon icon="radix-icons:cross-2" class="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </li>
            </ul>
            <Alert v-else>
                <AlertTitle class="flex items-center gap-2">
                    You have added no favorites.
                </AlertTitle>
            </Alert>
        </div>
        <div>
            <h2 class="text-lg">Created</h2>
            <Separator />
            <p class="text-muted-foreground my-2">Here are all the plans created by you</p>
            <ul v-if="latest.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li v-for="fav in latestSorted" :key="fav.id" class="flex gap-1">
                    <Button class="grow" as-child>
                        <NuxtLink :to="'/plan/' + fav.id">{{ fav.title }}</NuxtLink>
                    </Button>
                    <Button variant="outline" @click="myPlansStore.removeLatest(fav.id)">
                        <Icon icon="radix-icons:cross-2" class="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                </li>
            </ul>
            <Alert v-else>
                <AlertTitle class="flex items-center gap-2">
                    You have added no latest.
                </AlertTitle>
            </Alert>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'

const myPlansStore = useMyPlansStore();
const { favorites, latest } = storeToRefs(myPlansStore)

const favoritesSorted = computed(() => favorites.value.reverse())
const latestSorted = computed(() => latest.value.reverse())

useSeoMeta({
    title: 'My plans - FFXIV mitigation planner'
})
</script>