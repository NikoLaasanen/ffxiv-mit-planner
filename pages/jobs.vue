<template>
    <h1 class="text-lg">Jobs & abilities</h1>
    <Separator />
    <p class="my-4">Currently supported jobs and abilities are listed below.</p>

    <div class="flex flex-col gap-2">
        <p>You can manage ability visibility per ability basis by clicking the hide checkbox in the ability card.</p>
        <p>Hide visibility by ability type:</p>
        <div class="flex flex-wrap gap-2">
            <Button v-for="abilityType in abilityTypes" :key="abilityType"
                @click="setAbilityVisibilityByType(abilityType, false)">
                {{ abilityType?.charAt(0).toUpperCase() + abilityType.slice(1) }}
            </Button>
            <Button variant="destructive" @click="preferencesStore.clearJobAbilityVisibilites()">Clear
                visiblities</Button>
        </div>
        <!--
        <FfxivEditorAbility @new-ability="(newAbility, targetJobs) => addNewAbility(undefined, newAbility, targetJobs)" />
        -->
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
                    <ul class="grid gap-2" v-if="job.abilities.length > 0">
                        <li v-for="(ability, key) in job.abilities" :key="key" class="flex items-center gap-2">
                            <FfxivJobAbilityCard :ability="ability"
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
import { useAsyncState } from '@vueuse/core'
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import { JobKey } from '~/injectionkeys'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()

const preferencesStore = usePreferencesStore();
const db = useFirestore();
const jobRef = collection(db, 'job');
const jobAbilityRef = collection(db, 'jobability');

const { data: jobData, pending: loadingJobs } = useCollection<Job>(jobRef);
const jobs = computed(() => jobData.value.filter(j => j.abbr !== 'LB') ?? [])
provide(JobKey, jobs);

const abilityTypes = computed(() => jobs.value.reduce((types, job) => {
    job.abilities.forEach((ability: JobAbility) => {
        if (ability?.type && !types.includes(ability?.type)) {
            types.push(ability.type)
        }
    });
    return types;
}, ([] as JobAbilityType[])));

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

const {
    execute: addNewAbility,
    isLoading: isAddAbility
} = useAsyncState(
    async (newAbility: JobAbility, targetJobs: JobAbbrevation[]) => {
        const newId = newAbility.title.toLowerCase().replace(/ /g, '_')
        await setDoc(doc(jobAbilityRef, newId), newAbility).catch(e => console.log(e))
        for (const target of targetJobs) {

            // Fetch refs for abilities
            const updatedData = getJob(target)?.abilities.filter(obj => obj.title !== newAbility.title
            ).map(obj => {
                return doc(jobAbilityRef, obj.title.toLowerCase().replace(/ /g, '_'))
            }) ?? [];
            updatedData.push(doc(jobAbilityRef, newAbility.title.toLowerCase().replace(/ /g, '_')));
            getJob(target)?.abilities.push(newAbility);

            await updateDoc(doc(jobRef, target), {
                abilities: updatedData
            }).then(() => {
                toast({ description: 'Abilities updated' });
            }).catch(() => {
                toast({ description: 'Ability update failed', variant: 'destructive' });
            })
        }
    },
    null,
    { immediate: false }
)


const getJob = (jobAbbr: JobAbbrevation) => jobs?.value.find(job => job.abbr === jobAbbr);

useSeoMeta({
    title: 'Jobs & abilities - FFXIV mitigation planner'
})
</script>

<style scoped>
ul {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
</style>