<template>
    <div v-if="timelineEvent" class="grid grid-cols-subgrid gap-x-3 hover:bg-muted">
        <div>{{ timeInMinutes }}</div>
        <div>{{ timelineEvent.source }}</div>
        <div>{{ timelineEvent.ability.title }}</div>
        <div v-for="(jobAbbr, key) in activeJobs" :key="key" class="flex gap-1">
            <template v-for="ability in getJob(jobAbbr)?.abilities ?? []">
                <span class="w-6 h-6 flex items-center justify-center" @click="toggleAbility(jobAbbr, ability)">
                    <PlanRowActiveAbility :ability="ability" :owner="jobAbbr" :time="rowTime"
                        :activeAbilities="activeAbilities" />
                </span>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { JobKey, ActiveJobsKey } from '~/injectionkeys'

const emit = defineEmits<{
    (e: 'change:activeAbility', activeAbility: ActiveAbility): void
}>()

const props = defineProps({
    timelineEvent: Object as PropType<TimelineEvent>,
    activeAbilities: Object as PropType<ActiveAbility[]>
});
console.log(props.activeAbilities)

const rowTime = computed(() => props.timelineEvent?.time ?? 0)

const jobs = inject(JobKey, null)
const activeJobs = inject(ActiveJobsKey, null)
const jobCount = computed(() => activeJobs?.value.length ?? 0);

const timeInMinutes = computed(() => {
    const seconds = rowTime.value;
    return String(Math.floor(seconds / 60)) + ':' + String(seconds % 60).padStart(2, '0');
});

const getJob = (jobAbbr: JobAbbrevation) => jobs?.value.find(job => job.abbr === jobAbbr);

const toggleAbility = (jobAbbr: JobAbbrevation, jobAbility: JobAbility) => {
    emit('change:activeAbility', {
        time: rowTime.value,
        source: jobAbbr,
        ability: jobAbility
    } as ActiveAbility)
}
</script>

<style scoped>
.grid-cols-subgrid {
    grid-column: span v-bind(jobCount + 3);
}
</style>