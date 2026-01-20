<template>
    <ScrollArea v-if="timeline" class="scroll-area rounded-md border bg-muted p-4 pt-2">
        <div class="timeline p-2 pt-0 grid">
            <div class="bg-muted z-10 sticky top-0 grid grid-cols-subgrid gap-x-3 pb-1 mb-1 border-b-2 border-card">
                <div class="flex justify-center font-semibold self-end">
                    <Icon icon="radix-icons:clock" class="mb-1" />
                </div>
                <div class="font-semibold self-end">Cast</div>
                <div v-if="showColSource" class="font-semibold self-end">Source</div>
                <div v-if="showColSourceCount" class="font-semibold self-end text-right">Source count</div>
                <div v-if="showMedianDamage" class="font-semibold self-end text-right">Damage taken</div>
                <div class="font-semibold self-end text-center">Mitigated</div>

                <div v-for="(jobAbbr, key) in activeJobs" :key="key" class="flex gap-1 flex-col items-center">
                    <FfxivIcon :icon-data="getJob(jobAbbr)" />
                    <div class="flex gap-1">
                        <template v-for="ability in getJob(jobAbbr)?.abilities" :for="ability.title">
                            <FfxivIcon v-if="preferencesStore.isAbilityVisible(ability)" :icon-data="ability" />
                        </template>
                    </div>
                </div>
            </div>
            <PlanRow v-for="(timelineEvent, key) in timelineEvents" :key="key" :timeline-event="timelineEvent"
                :active-abilities="activeAbilities" :class="{ 'text-neutral-600': !(timelineEvent.visible ?? true) }"
                @change:activeAbility="item => $.emit('change:activeAbility', item)"
                @change:rowVisibility="$.emit('change:rowVisibility', timelineEvent)"
                @change:damageType="newType => $.emit('change:damageType', timelineEvent, newType)"
                @add:damageValue="newDmgVal => $.emit('add:rowDamageValue', timelineEvent, newDmgVal)"
                @remove:damageValue="removedKey => $.emit('remove:rowDamageValue', timelineEvent, removedKey)" />
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <div class="mt-2 flex flex-wrap gap-2">
        <PlanJobList :active-jobs="activeJobs" @change:active-job="jobAbbr => toggleActiveJob(jobAbbr)" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
        <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-2">
                <Checkbox id="plan-show-hidden-items" :checked="showHiddenRows"
                    @click="showHiddenRows = !showHiddenRows" />
                <Label for="plan-show-hidden-items" class="self-center font-normal">Show hidden items</Label>
            </div>
            <div class="flex flex-wrap gap-2">
                <Checkbox id="plan-show-detailed-damage-values" :checked="showDetailedDamageValues"
                    @click="showDetailedDamageValues = !showDetailedDamageValues" />
                <Label for="plan-show-detailed-damage-values" class="self-center font-normal">Show detailed damage
                    values</Label>
            </div>
        </div>
        <div v-if="showMedianDamage">
            <Label>Set damage threshold</Label>
            <Input v-model="damageThreshold" type="number" class="max-w-prose" />
            <p class="text-muted-foreground text-sm">Damage taken values higher than threshold are considered
                dangerous and
                will be highlighed in the timeline.</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { JobKey, ActiveJobsKey } from '~/injectionkeys'
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
    (e: 'change:activeAbility', activeAbility: ActiveAbility): void,
    (e: 'change:rowVisibility', timelineEvent: TimelineEvent): void,
    (e: 'change:damageType', timelineEvent: TimelineEvent, damageType: DamageType): void,
    (e: 'add:rowDamageValue', timelineEvent: TimelineEvent, newValue: number): void,
    (e: 'remove:rowDamageValue', timelineEvent: TimelineEvent, removedKey: number): void,
}>()

const props = defineProps({
    timeline: Object as PropType<Timeline>,
    activeAbilities: Array as PropType<ActiveAbility[]>,
    activeJobs: Array as PropType<JobAbbrevation[]>
})

const preferencesStore = usePreferencesStore();
const { showAutoAttacks, showMedianDamage, showColSource, showColSourceCount } = storeToRefs(preferencesStore);
const showHiddenRows = ref(false);
const showDetailedDamageValues = ref(false);
provide('showDetailedDamageValues', showDetailedDamageValues);
const damageThreshold = ref(0);
provide('damage-threshold', damageThreshold);

const jobs = inject(JobKey, null)
const activeJobs = ref([] as JobAbbrevation[]);
provide(ActiveJobsKey, activeJobs);

const timelineEvents = computed(() => {
    const autoAttackTitles = ['attack', 'Attack'];
    return props.timeline?.events.filter(item =>
        // Check preference for showing auto attacks        
        (showAutoAttacks.value || (!showAutoAttacks.value && !autoAttackTitles.includes(item.ability.title))) &&
        ((item?.visible ?? true) || showHiddenRows.value)
    )
})

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
    // Add other preselected jobs
    props.activeJobs?.forEach(jobAbbr => {
        if (!activeJobs.value.includes(jobAbbr)) {
            activeJobs.value.push(jobAbbr)
        }
    })
})

const fixedColumnCount = ref(2);
const dataColumnCount = computed(() => {
    let columns = 1;
    if (showMedianDamage.value) columns++;
    if (showColSource.value) columns++;
    if (showColSourceCount.value) columns++;

    return columns;
});
const jobColumnCount = computed(() => activeJobs.value.length ?? 0);
</script>

<style scoped>
.scroll-area {
    height: max(400px, 65vh);
}

.timeline {
    grid-template-columns: 50px 1fr repeat(v-bind(dataColumnCount), 100px) repeat(max(v-bind(jobColumnCount), 1), auto);
}

.timeline>.grid-cols-subgrid {
    grid-column: span v-bind(jobColumnCount + fixedColumnCount + dataColumnCount);
}
</style>