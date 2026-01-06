<template>
    <Label for="fflogs-import-url" class="sr-only">URL:</Label>
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
        <Input type="text" id="fflogs-import-url"
            placeholder="https://www.fflogs.com/reports/<report_id>?fight=<fight_id>" v-model="url" @input="readUrl" />
        <Button type="button" class="ml-auto w-full sm:w-auto" :disabled="!isValidUrl"
            @click.prevent="fetchLog">Go</Button>
    </div>
</template>

<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core';

const emit = defineEmits<{
    (e: 'newTimeline', timelineEvents: TimelineEvent[]): void
}>()

const url = ref('')

const reportId = ref('');
const fightId = ref(0);

const previousReport = ref('')
const previousFight = ref(0)

const isValidUrl = computed(() => reportId.value.length > 5 && fightId.value > 0 && reportId.value != previousReport.value && fightId.value != previousFight.value)

const events = ref<fflogs_event[]>([]);
const actorMap = ref<Map<number, fflogs_actor>>(new Map());
const abilityMap = ref<Map<number, fflogs_ability>>(new Map());

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
        const response = await fetchEvents(reportId.value, fightId.value);
        report = response?.data?.reportData.report;

        previousReport.value = reportId.value;
        previousFight.value = fightId.value;
    } catch (e) {
        console.error(e)
    }

    if (report) {
        // Set actors
        const actors: fflogs_actor[] = report?.masterData?.actors ?? [];
        actors.forEach(a => actorMap.value.set(a.id, a))
        // Set abilities
        const abilities: fflogs_ability[] = report?.masterData?.abilities ?? [];
        abilities.forEach(a => abilityMap.value.set(a.gameID, a))
        // Set events
        events.value = report?.events?.data ?? [];

        parseData()
    }
}

const parseData = () => {
    const timeline = [] as TimelineEvent[];
    let firstEventTimestamp = -1;
    for (const event of events.value) {
        const actor = actorMap.value.get(event.sourceID);
        if (event.type === 'damage' && actor && actor.type === 'NPC' && actor.name !== 'Environment') {
            if (firstEventTimestamp < 0) {
                firstEventTimestamp = event.timestamp;
            }
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

        if (timeline.length > 0) {
            emit('newTimeline', timeline);
        }
    }
}

const getTimeInSeconds = (timestamp: number) => {
    if (timestamp >= 0) {
        return Math.round(timestamp / 1000);
    }
    return -1;
}
</script>