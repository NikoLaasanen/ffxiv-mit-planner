<template>
    <Button v-for="job in sortedJobs" :key="job.abbr" :disabled="job.abilities?.length === 0"
        :variant="activeJobs?.includes(job.abbr) ? 'default' : 'outline'" @click="$.emit('change:activeJob', job.abbr)">
        <FfxivIcon :icon-data="job" />
    </Button>
</template>

<script lang="ts" setup>
import { JobKey } from '~/injectionkeys'

const emit = defineEmits<{
    (e: 'change:activeJob', jobAbbr: JobAbbrevation): void,
}>()


defineProps({
    activeJobs: Array as PropType<JobAbbrevation[]>
})

const jobs = inject(JobKey, null)

const sortedJobs = computed(() => {
    const order = { 'tank': 1, 'healer': 2, 'dps': 3 }
    const subOrder = { 'regen': 1, 'shield': 2, 'melee': 3, 'caster': 4, 'ranged': 5, 'none': 6 };
    return jobs?.value.sort((a, b) => {
        let orderA = order[a.role] || 1000;
        let orderB = order[b.role] || 1000;
        if (orderA === orderB) {
            orderA = subOrder[a?.subrole ?? 'none'] || 1000;
            orderB = subOrder[b?.subrole ?? 'none'] || 1000;
        }

        return orderA - orderB;
    }) ?? []
})
</script>