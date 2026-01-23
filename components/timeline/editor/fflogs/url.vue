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
import { useFFlogsParser } from '~/composables/useFFlogsParser';

const emit = defineEmits<{
    (e: 'urlParsed', url: string, timelineEvents: TimelineEvent[], players: JobAbbrevation[], activeAbilities: ActiveAbility[], mistakes: PlayerMistake[]): void
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

const {
    parseFFLogsUrl: parseUrl,
    getFirstEventTimestamp,
    parseTimelineData,
    parseActiveAbilityData,
    parseDebuffData,
    parseDeathData,
    parseActiveJobs,
} = useFFlogsParser(actorMap, abilityMap, jobAbilities)

const readUrl = useDebounceFn(() => {
    const { reportId: id, fightId: fight } = parseUrl(url.value)
    reportId.value = id
    fightId.value = fight
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
        let mistakes: PlayerMistake[] = [];
        if (loadPlayerEvents.value) {
            activeAbilities = await loadPlayerAbilities(firstEventTimestamp);
            players = parseActiveJobs(activeAbilities);
            mistakes = await loadPlayerMistakes(firstEventTimestamp);
        }

        if (timeline.length > 0) {
            emit('urlParsed', url.value, timeline, players, activeAbilities, mistakes);
        }
    }
}

const loadPlayerAbilities = async (firstEventTimestamp: number): Promise<ActiveAbility[]> => {
    let report;
    try {
        const response = await fetchActiveAbilities(reportId.value, fightId.value);
        report = response?.data?.reportData.report;
    } catch (e) {
        console.error('Error fetching player buffs:', e);
    }

    if (report) {
        const events = (report?.events?.data ?? []) as fflogs_event[];
        const activeAbilities = parseActiveAbilityData(events, firstEventTimestamp);
        return activeAbilities;
    }
    return [];
}

const loadPlayerMistakes = async (firstEventTimestamp: number): Promise<PlayerMistake[]> => {
    let report;
    let mistakes: PlayerMistake[] = [];
    try {
        const response = await fetchPlayerDebuffs(reportId.value, fightId.value);
        report = response?.data?.reportData.report;
    } catch (e) {
        console.error('Error fetching player debuffs:', e);
    }

    if (report) {
        const events = (report?.events?.data ?? []) as fflogs_event[];
        const mistakes_debuff = parseDebuffData(events, firstEventTimestamp);
        mistakes = mistakes.concat(mistakes_debuff);
    }

    try {
        const response = await fetchPlayerDeaths(reportId.value, fightId.value);
        report = response?.data?.reportData.report;
    } catch (e) {
        console.error('Error fetching player deaths:', e);
    }

    if (report) {
        const events = (report?.events?.data ?? []) as fflogs_event[];
        const mistakes_death = parseDeathData(events, firstEventTimestamp);
        mistakes = mistakes.concat(mistakes_death);
    }

    return mistakes;
}
</script>