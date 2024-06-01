<template>
    <h1 class="text-lg">Jobs & abilities</h1>
    <Separator />
    <p>Currently supported jobs and abilities are listed below.</p>

    <div class="mt-4 border rounded p-2 bg-muted">
        <LoadingIcon v-if="loadingJobs" />
        <div v-else class="grid grid-cols-[minmax(200px,_20vw)_1fr] gap-4">
            <template v-for="job in jobs" :key="job.id">
                <div class="grid grid-cols-subgrid col-span-1">
                    <div class="flex gap-2">
                        <FfxivIcon :icon-data="job" /> {{ job.title }}
                    </div>
                </div>
                <div class="grid grid-cols-subgrid col-span-1">
                    <ul class="grid gap-2">
                        <li v-for="ability in job.abilities" :key="ability.title" class="flex items-center gap-2">
                            <FfxivJobAbilityCard :ability="ability" />
                        </li>
                    </ul>
                </div>
                <Separator class="col-span-2 bg-foreground h-[1px]" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { collection } from 'firebase/firestore'

const db = useFirestore();
const jobRef = collection(db, 'job');

const { data: jobs, pending: loadingJobs } = useCollection<Job>(jobRef);
</script>

<style scoped>
ul {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
</style>