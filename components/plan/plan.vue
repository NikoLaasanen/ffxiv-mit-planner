<template>
    <ScrollArea v-if="timeline" class="scroll-area rounded-md border bg-muted p-4 pt-2">
        <div class="timeline p-2 pt-0 grid">
            <div class="bg-muted z-10 sticky top-0 grid grid-cols-subgrid gap-x-3 pb-1 mb-1 border-b-2 border-card">
                <div class="flex justify-center font-semibold self-end">
                    <Icon icon="radix-icons:clock" class="mb-1" />
                </div>
                <div class="font-semibold self-end">Cast</div>
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
                @change:damageType="newType => $.emit('change:damageType', timelineEvent, newType)" />
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <div class="mt-2 flex flex-wrap gap-2">
        <Button v-for="job in jobs" :key="job.abbr" :disabled="job.abilities?.length === 0"
            :variant="activeJobs.includes(job.abbr) ? 'default' : 'outline'" @click="toggleActiveJob(job.abbr)">
            <FfxivIcon :icon-data="job" />
        </Button>
    </div>
    <div class="mt-4">
        <div class="flex flex-wrap gap-2">
            <Checkbox id="plan-show-hidden-items" :checked="showHiddenRows" @click="showHiddenRows = !showHiddenRows" />
            <Label for="plan-show-hidden-items" class="self-center font-normal">Show hidden items</Label>
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
}>()

const props = defineProps({
    timeline: Object as PropType<Timeline>,
    activeAbilities: Array as PropType<ActiveAbility[]>
})

const preferencesStore = usePreferencesStore();
const { showAutoAttacks, showMedianDamage } = storeToRefs(preferencesStore);
const showHiddenRows = ref(false);

const jobs = inject(JobKey, null)
const activeJobs = ref([] as JobAbbrevation[]);
provide(ActiveJobsKey, activeJobs);

const timelineEvents = computed(() => {
    return props.timeline?.events.filter(item =>
        // Check preference for showing auto attacks        
        (showAutoAttacks.value || (!showAutoAttacks.value && item.ability.title !== 'attack')) &&
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
})

const fixedColumnCount = ref(2);
const dataColumnCount = computed(() => showMedianDamage.value ? 2 : 1);
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