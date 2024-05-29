<template>
    <h1>jobs</h1>

    <div class="main-grid grid">
        <template v-for="job in jobs" :key="job.id">
            <div class="flex items-center gap-2">
                <FfxivIcon :icon-data="job" /> {{ job.title }}
            </div>
            <ul class="flex gap-2">
                <li v-for="ability in job.abilities" :key="ability.title" class="flex items-center gap-2">
                    <FfxivIcon :icon-data="ability" /> {{ ability.title }}
                </li>
            </ul>
        </template>
    </div>
    {{ jobs }}
</template>

<script lang="ts" setup>
import { collection } from 'firebase/firestore'

const db = useFirestore();
const jobRef = collection(db, 'job');

const jobs = useCollection<Job>(jobRef);
</script>

<style scoped>
.grid.main-grid {
    grid-template-columns: min(200px, 20vw) 1fr;
}
</style>