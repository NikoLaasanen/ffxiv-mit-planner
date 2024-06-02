<template>
    <div v-if="timelineEvent" class="relative grid grid-cols-subgrid gap-x-3 items-center hover:bg-muted">
        <div class="font-light text-center">{{ timeInMinutes }}</div>
        <div class="group">
            {{ timelineEvent.ability.title }}
            <template v-if="timelineEvent.ability?.interruptable">
                <Badge v-if="!activeAbilities || !isAbilityInterrupted(timelineEvent, activeAbilities)"
                    variant="destructive">
                    <Icon icon="radix-icons:exclamation-triangle" class="mr-2" /> Interrupt missing!
                </Badge>
            </template>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button v-if="rowVisible" variant="ghost" size="icon" @click="$.emit('change:rowVisibility')"
                            class="h-[1.4rem] w-[1.4rem] text-neutral-600 hover:text-neutral-100 hidden group-hover:inline-flex">
                            <Icon icon="radix-icons:eye-none" />
                        </Button>
                        <Button v-else variant="ghost" size="icon" @click="$.emit('change:rowVisibility')"
                            class="h-[1.4rem] w-[1.4rem] text-neutral-600 hover:text-neutral-100 hidden group-hover:inline-flex">
                            <Icon icon="radix-icons:eye-open" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Toggle visibility</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
        <div class="text-center">
            <span v-if="totalMitigation > 0">
                {{ totalMitigation.toLocaleString(undefined, { maximumFractionDigits: 2 }) }}<small
                    class="text-muted-foreground">%</small>
            </span>
        </div>
        <div v-for="(jobAbbr, key) in activeJobs" :key="key" class="flex gap-1">
            <template v-for="ability in getJob(jobAbbr)?.abilities ?? []">
                <span v-if="preferencesStore.isAbilityVisible(ability)"
                    class="w-6 h-6 flex items-center justify-center">
                    <PlanRowActiveAbility :ability="ability" :owner="jobAbbr" :time="rowTime"
                        :activeAbilities="activeAbilities" :activation-buffer="activationBuffer"
                        @change:ability="toggleAbility(jobAbbr, ability)" />
                </span>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { isAbilityInterrupted } from '@/lib/utils'
import { Icon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { JobKey, ActiveJobsKey } from '~/injectionkeys'

const preferencesStore = usePreferencesStore();
const { activationBuffer } = storeToRefs(preferencesStore);

const emit = defineEmits<{
    (e: 'change:activeAbility', activeAbility: ActiveAbility): void,
    (e: 'change:rowVisibility'): void,
}>()

const props = defineProps({
    timelineEvent: Object as PropType<TimelineEvent>,
    activeAbilities: Object as PropType<ActiveAbility[]>
});

const rowTime = computed(() => props.timelineEvent?.time ?? 0)
const rowVisible = computed(() => props.timelineEvent?.visible ?? true)

const jobs = inject(JobKey, null)
const activeJobs = inject(ActiveJobsKey, null)
const jobCount = computed(() => activeJobs?.value.length ?? 0);

const timeInMinutes = computed(() => {
    const seconds = rowTime.value;
    return String(Math.floor(seconds / 60)) + ':' + String(seconds % 60).padStart(2, '0');
});

const damageType = computed(() => props.timelineEvent?.ability.damageType ?? 'magical');

const totalMitigation = computed(() => {
    const rowActive = props.activeAbilities?.filter(item => {
        return rowTime.value === item.time || (rowTime.value > item.time &&
            rowTime.value < item.time + item.ability.duration - activationBuffer.value)
    })

    const addedAbilities = [] as string[];
    const dmgPercent = rowActive?.reduce((dmg, activeAbility) => {
        // Active ability has potency specified so add it
        if (allowMit(activeAbility.ability.title, addedAbilities) &&
            activeAbility.ability.potency &&
            Object.keys(activeAbility.ability.potency).includes(damageType.value)
        ) {
            // @ts-ignore: Dynamic key causes ts error
            const p = activeAbility.ability.potency[damageType.value];
            if (p > 0) {
                addedAbilities.push(activeAbility.ability.title);
                return dmg * (1 - p / 100);
            }
        }
        return dmg;
    }, 100) ?? 0;
    return 100 - dmgPercent;
});

const allowMit = (title: string, added: string[]) => {
    const rangedAbilities = ['Troubadour', 'Tactician', 'Shield Samba'];
    // Check if title is one of the checked rangedAbilities and if yes, 
    // check if one of the was already added
    if (added.includes(title)) {
        return false;
    }
    else if (rangedAbilities.includes(title)) {
        return rangedAbilities.filter(item => added.includes(item)).length === 0;
    }
    return true;
}

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