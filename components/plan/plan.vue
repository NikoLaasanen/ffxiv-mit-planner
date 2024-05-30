<template>
    <ScrollArea v-if="timeline" class="h-[400px] rounded-md border p-4">
        <div class="timeline p-2 grid">
            <div class="bg-card z-10 sticky top-0 grid grid-cols-subgrid gap-x-3 pb-1 mb-1 border-b-2">
                <div class="font-semibold self-end">Time</div>
                <div class="font-semibold self-end">Source</div>
                <div class="font-semibold self-end">Cast</div>

                <div v-for="(jobAbbr, key) in activeJobs" :key="key" class="flex gap-1 flex-col items-center">
                    <FfxivIcon :icon-data="getJob(jobAbbr)" />
                    <div class="flex gap-1">
                        <FfxivIcon v-for="ability in getJob(jobAbbr)?.abilities" :for="ability.title"
                            :icon-data="ability" />
                    </div>
                </div>
            </div>
            <PlanRow v-for="timelineEvent in timeline.events" :key="timelineEvent.time" :timeline-event="timelineEvent"
                :active-abilities="activeAbilities"
                @change:activeAbility="item => $emit('change:activeAbility', item)" />
        </div>
    </ScrollArea>
    <div class="mt-2 flex flex-wrap gap-2">
        <Button v-for="job in jobs" :key="job.abbr" :disabled="job.abilities?.length === 0"
            @click="toggleActiveJob(job.abbr)">
            <FfxivIcon :icon-data="job" />
        </Button>
    </div>
</template>

<script lang="ts" setup>
import { JobKey, ActiveJobsKey } from '~/injectionkeys'

const emit = defineEmits<{
    (e: 'change:activeAbility', activeAbility: ActiveAbility): void
}>()

const props = defineProps({
    timeline: Object as PropType<Timeline>,
    activeAbilities: Array as PropType<ActiveAbility[]>,
})

const jobs = inject(JobKey, null)
const activeJobs = ref([] as JobAbbrevation[]);
provide(ActiveJobsKey, activeJobs);
const jobCount = computed(() => activeJobs.value.length ?? 0);

const toggleActiveJob = (jobAbbr: JobAbbrevation) => {
    if (activeJobs.value.includes(jobAbbr)) {
        activeJobs.value = activeJobs.value.filter(item => item !== jobAbbr);
    } else {
        activeJobs.value.push(jobAbbr)
    }
}

const getJob = (jobAbbr: JobAbbrevation) => jobs?.value.find(job => job.abbr === jobAbbr);

onMounted(() => {
    // Set active jobs based on initial load
    activeJobs.value = [...new Set(props.activeAbilities?.map(item => item.source))];
})
</script>

<style scoped>
.timeline {
    grid-template-columns: 50px 1fr 2fr repeat(v-bind(jobCount), auto);
}

.timeline>.grid-cols-subgrid {
    grid-column: span v-bind(jobCount + 3);
}
</style>