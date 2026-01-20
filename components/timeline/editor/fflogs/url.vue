<template>
    <Label for="fflogs-import-url" class="sr-only">URL:</Label>
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input type="text" id="fflogs-import-url"
            placeholder="https://www.fflogs.com/reports/<report_id>?fight=<fight_id>" v-model="url" @input="readUrl" />
        <Button type="button" class="ml-auto w-full sm:w-auto" :disabled="!isValidUrl"
            @click.prevent="fetchLog">Go</Button>
    </div>
    <div class="flex gap-2 mt-2">
        <Checkbox id="load-player-events" :checked="loadPlayerEvents" @click="loadPlayerEvents = !loadPlayerEvents" />
        <Label for="load-player-events" class="self-center font-normal">Load player events</Label>
    </div>
</template>

<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core';
import { JobAbilityKey } from '~/injectionkeys'

const emit = defineEmits<{
    (e: 'urlParsed', url: string, timelineEvents: TimelineEvent[], players: JobAbbrevation[], activeAbilities: ActiveAbility[]): void
}>()

const url = ref('')
const loadPlayerEvents = ref(false)

const reportId = ref('');
const fightId = ref(0);

const previousReport = ref('')
const previousFight = ref(0)

const isValidUrl = computed(() => reportId.value.length > 5 && fightId.value > 0 && reportId.value != previousReport.value && fightId.value != previousFight.value)

const actorMap = ref<Map<number, fflogs_actor>>(new Map());
const abilityMap = ref<Map<number, fflogs_ability>>(new Map());

const jobAbilities = inject(JobAbilityKey, null)

const parseFFLogsUrl = (url: string) => {
    const pattern = /fflogs\.com\/reports\/([^/?#]+).*?[?&]fight=(\d+)/;
    const match = url.match(pattern);

    if (!match) {
        reportId.value = ''
        fightId.value = 0
        return
    }

    reportId.value = match[1]
    fightId.value = parseInt(match[2])
}

const readUrl = useDebounceFn(() => {
    parseFFLogsUrl(url.value)
}, 300)

const fetchLog = async () => {
    let report;
    try {
        const response = await fetchTimelineEvents(reportId.value, fightId.value);
        report = response?.data?.reportData.report;

        previousReport.value = reportId.value;
        previousFight.value = fightId.value;
    } catch (e) {
        console.error('Error fetching report:', e);
    }

    if (report) {
        // Set actors
        const actors: fflogs_actor[] = report?.masterData?.actors ?? [];
        actors.forEach(a => actorMap.value.set(a.id, a))
        // Set abilities
        const abilities: fflogs_ability[] = report?.masterData?.abilities ?? [];
        abilities.forEach(a => abilityMap.value.set(a.gameID, a))
        // Set events
        const events = (report?.events?.data ?? []) as fflogs_event[];

        const firstEventTimestamp = getFirstEventTimestamp(events);
        const timeline = parseTimelineData(events, firstEventTimestamp);
        let players: JobAbbrevation[] = [];
        let activeAbilities: ActiveAbility[] = [];
        if (loadPlayerEvents.value) {
            players = parseActiveJobs();
            activeAbilities = await loadPlayerAbilities(firstEventTimestamp);
        }

        if (timeline.length > 0) {
            emit('urlParsed', url.value, timeline, players, activeAbilities);
        }
    }
}

const getFirstEventTimestamp = (events: fflogs_event[]): number => {
    for (const event of events) {
        const actor = actorMap.value.get(event.sourceID);
        if (event.type === 'damage' && actor && actor.type === 'NPC' && actor.name !== 'Environment') {
            return event.timestamp;
        }
    }
    return 0;
}

const parseTimelineData = (events: fflogs_event[], firstEventTimestamp: number): TimelineEvent[] => {
    const timeline = [] as TimelineEvent[];
    for (const event of events) {
        const actor = actorMap.value.get(event.sourceID);
        if (event.type === 'damage' && actor && actor.type === 'NPC' && actor.name !== 'Environment') {
            const time = getTimeInSeconds(event.timestamp - firstEventTimestamp);
            const abilityName = abilityMap.value.get(event.abilityGameID)?.name ?? 'Unknown';
            const damage = event.unmitigatedAmount ?? event.amount ?? 0;

            const last = timeline[timeline.length - 1];

            // Check if we should merge with the previous entry 
            const shouldMerge = last && last.source === actor.name && last.ability.title === abilityName && Math.abs(last.time - time) < 0.05; // 50 ms window
            if (shouldMerge) {
                last.sourceCount += 1;
                if (damage > 0) {
                    last.ability.unmitigatedDamage.push(damage);
                }
            } else {
                timeline.push({
                    time: time,
                    source: actor.name,
                    sourceCount: 1,
                    ability: {
                        title: abilityName,
                        damageType: 'magical',
                        unmitigatedDamage: damage > 0 ? [event.unmitigatedAmount ?? event.amount] : []
                    } as BossAbility
                } as TimelineEvent);
            }
        }
    }
    return timeline;
}

const loadPlayerAbilities = async (firstEventTimestamp: number): Promise<ActiveAbility[]> => {
    if (loadPlayerEvents.value) {
        let report;
        try {
            const response = await fetchActiveAbilities(reportId.value, fightId.value);
            report = response?.data?.reportData.report;
        } catch (e) {
            console.error('Error fetching player buffs:', e);
        }

        if (report) {
            const events = (report?.events?.data ?? []) as fflogs_event[];
            const activeAbilities = parseActiveAbilitydata(events, firstEventTimestamp);
            return activeAbilities;
        }
    }
    return [];
}

const parseActiveAbilitydata = (events: fflogs_event[], firstEventTimestamp: number): ActiveAbility[] => {
    const activeAbilities: ActiveAbility[] = [];

    for (const event of events) {
        const actor = actorMap.value.get(event.sourceID);
        // Only track player buff applications
        if (event.type === 'cast' && actor && actor.type === 'Player' && actor.subType != 'Unknown') {
            const abilityName = (abilityMap.value.get(event.abilityGameID)?.name ?? 'Unknown') as string;
            const jobAbbr = fflogsJobMap[actor.subType as string];
            const jobAbility = getJobAbilityByName(abilityName);
            if (jobAbbr && jobAbility) {
                activeAbilities.push({
                    source: jobAbbr,
                    ability: jobAbility,
                    time: getTimeInSeconds(event.timestamp - firstEventTimestamp)
                } as ActiveAbility);
            }
        }
    }

    return activeAbilities;
}

const getJobAbilityByName = (name: string): JobAbility | null => {
    if (!jobAbilities) return null;

    for (const ability of jobAbilities.value) {
        if (ability.title === name) {
            return ability;
        }
    }
    return null;
}

const parseActiveJobs = (): JobAbbrevation[] => {
    const jobs: JobAbbrevation[] = [];

    actorMap.value.forEach(actor => {
        if (actor.type === 'Player' && actor.subType != 'Unknown') {
            const jobAbbr = fflogsJobMap[actor.subType as string];
            if (jobAbbr && !jobs.includes(jobAbbr)) {
                jobs.push(jobAbbr);
            }
        }
    });
    // Sort jobs so we get healers > tanks > dps > misc
    jobs.sort((a, b) => getRolePriority(a) - getRolePriority(b));

    return jobs;
}

const fflogsJobMap: Record<string, JobAbbrevation> = {
    'Paladin': 'PLD' as TankAbbr,
    'Warrior': 'WAR' as TankAbbr,
    'DarkKnight': 'DRK' as TankAbbr,
    'Gunbreaker': 'GNB' as TankAbbr,
    'WhiteMage': 'WHM' as HealerAbbr,
    'Scholar': 'SCH' as HealerAbbr,
    'Astrologian': 'AST' as HealerAbbr,
    'Sage': 'SGE' as HealerAbbr,
    'Monk': 'MNK' as MeleeDpsAbbr,
    'Dragoon': 'DRG' as MeleeDpsAbbr,
    'Ninja': 'NIN' as MeleeDpsAbbr,
    'Samurai': 'SAM' as MeleeDpsAbbr,
    'Reaper': 'RPR' as MeleeDpsAbbr,
    'Viper': 'VPR' as MeleeDpsAbbr,
    'BlackMage': 'BLM' as CasterDpsAbbr,
    'Summoner': 'SMN' as CasterDpsAbbr,
    'RedMage': 'RDM' as CasterDpsAbbr,
    'Pictomancer': 'PCT' as CasterDpsAbbr,
    'Bard': 'BRD' as RangedDpsAbbr,
    'Machinist': 'MCH' as RangedDpsAbbr,
    'Dancer': 'DNC' as RangedDpsAbbr,
    'LimitBreak': 'LB' as MiscOptionsAbbr // Special case for Limit Breaks
};

// Sort jobs based on role using JobAbbrevation subtypes
const isHealer = (job: JobAbbrevation): job is HealerAbbr =>
    ['WHM', 'SCH', 'AST', 'SGE'].includes(job as HealerAbbr);

const isTank = (job: JobAbbrevation): job is TankAbbr =>
    ['PLD', 'WAR', 'DRK', 'GNB'].includes(job as TankAbbr);

const isDps = (job: JobAbbrevation): job is DpsAbbr =>
    ['DRG', 'MNK', 'NIN', 'SAM', 'RPR', 'VPR', 'BLM', 'SMN', 'RDM', 'PCT', 'BRD', 'MCH', 'DNC'].includes(job as DpsAbbr);

const getRolePriority = (job: JobAbbrevation): number => {
    if (isHealer(job)) return 0;
    if (isTank(job)) return 1;
    if (isDps(job)) return 2;
    return 3; // MiscOptionsAbbr
};

const getTimeInSeconds = (timestamp: number) => {
    if (timestamp >= 0) {
        return Math.round(timestamp / 1000);
    }
    return -1;
}
</script>