<template>
    <h1 class="text-lg">Jobs & abilities</h1>
    <Separator />
    <p class="mb-4">Currently supported jobs and abilities are listed below.</p>

    <div class="flex flex-col gap-2">
        <p>You can manage ability visibility per ability basis by clicking the hide checkbox in the ability card.</p>
        <p>Toggle visibility by ability type:</p>
        <div class="flex flex-wrap gap-2">
            <Button v-for="abilityType in abilityTypes" :key="abilityType"
                @click="setAbilityVisibilityByType(abilityType, false)">
                {{ abilityType.charAt(0).toUpperCase() + abilityType.slice(1) }}
            </Button>
            <Button variant="destructive" @click="preferencesStore.clearJobAbilityVisibilites()">Clear
                visiblities</Button>
        </div>
    </div>

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
                            <FfxivJobAbilityCard :ability="ability" :edit-visibility="true"
                                @change:visibility="preferencesStore.toggleJobAbilityVisibility(ability)" />
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

const preferencesStore = usePreferencesStore();
const db = useFirestore();
const jobRef = collection(db, 'job');

const { data: jobs, pending: loadingJobs } = useCollection<Job>(jobRef);

const abilityTypes = computed(() => jobs.value.reduce((types, job) => {
    job.abilities.forEach(ability => {
        if (!types.includes(ability.type)) {
            types.push(ability.type)
        }
    });
    return types;
}, []));

const setAbilityVisibilityByType = (abilityType: JobAbilityType, show: boolean) => {
    const added = [];
    jobs.value.forEach(job => {
        job.abilities.forEach((ability: JobAbility) => {
            if (ability.type === abilityType) {
                preferencesStore.setJobAbilityVisibility(ability, show)
            }
        })
    });
}
</script>

<style scoped>
ul {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
</style>