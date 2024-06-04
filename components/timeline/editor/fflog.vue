<template>
    <Textarea class="mb-4" v-model="rawData"></textarea>

    <Label for="fflogs-import-merge-abilities">Merge abilities by</Label>
    <Select id="fflogs-import-merge-abilities" v-model="mergeBy">
        <SelectTrigger>
            <SelectValue placeholder="Select merge method" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="time-source">Time and source</SelectItem>
                <SelectItem value="none">Don't merge</SelectItem>
            </SelectGroup>
        </SelectContent>
    </Select>

    <Label for="fflogs-import-time-offset">Offset timestamp (s):</Label>
    <Input type="number" id="fflogs-import-time-offset" v-model="timeOffset" />

    <Button class="mt-4" @click="doParse" :disabled="rawData.trim().length === 0">Import</Button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
    (e: 'newTimeline', timelineEvents: TimelineEvent[]): void
}>()

const rawData = ref('');
const mergeBy = ref('time');
const timeOffset = ref(0);

const doParse = () => {
    if (rawData.value.trim().length > 0) {
        const timeline = [] as TimelineEvent[];
        // Transform fflogs data to a more easily readable array
        for (const row of getBetterCsvData(rawData.value.split('\n'))) {
            const newEvent = {
                time: getFFlogsTimeInSeconds(row.timestamp),
                source: row.source,
                ability: {
                    title: row.event,
                    damageType: 'magical',
                    unmitigatedDamage: [row.unmitigatedDamage]
                } as BossAbility
            } as TimelineEvent;

            // If merging is enabled check last entry
            if (mergeBy.value !== "none" && timeline.length > 0) {
                const lastEntry = timeline[timeline.length - 1];
                if (mergeBy.value === "time" && lastEntry.time === newEvent.time) {
                    if (lastEntry.source !== newEvent.source) {
                        lastEntry.source = "Multiple sources";
                    }
                    lastEntry.ability.unmitigatedDamage.push(newEvent.ability.unmitigatedDamage[0]);
                    continue;
                } else if ((mergeBy.value === "time-source" && lastEntry.source === newEvent.source) ||
                    (mergeBy.value === "both" && lastEntry.time === newEvent.time && lastEntry.source === newEvent.source)) {
                    lastEntry.ability.unmitigatedDamage.push(newEvent.ability.unmitigatedDamage[0]);
                    continue;
                }
            }

            timeline.push(newEvent)
        }

        rawData.value = '';
        emit('newTimeline', timeline);
    }
};

function getBetterCsvData(allLines: string[]) {
    const listOfEvents = [];

    for (let i = 0; i < allLines.length; i++) {
        const line = allLines[i];
        if (!line.includes("prepares  ")) continue;

        const cur = {} as ImportedData;
        let event;

        // Find time and raw event text
        const timeStart = line.indexOf('"');
        const timeEnd = line.indexOf('"', timeStart + 1);
        const eventStart = line.indexOf('"', timeEnd + 1);
        const eventEnd = line.indexOf('"', eventStart + 1);

        cur.timestamp = line.substring(timeStart + 1, timeEnd);
        event = line.substring(eventStart + 1, eventEnd);

        // Find source, event, target
        const preparesPos = event.indexOf("prepares  ");
        const onPos = event.indexOf("  on");
        const dashPos = event.indexOf("--");
        const onToDash = event.substring(onPos + 4, dashPos).trim();

        const [word1, word2] = onToDash.split(" ");
        cur.source = event.substring(0, preparesPos - 1);
        cur.event = event.substring(preparesPos + 10, onPos);
        cur.target = `${word1} ${word2}`;
        // Find matching damage text
        let dmgText = "";
        for (let i2 = i + 1; i2 < allLines.length; i2++) {
            const target = allLines[i2];
            if (!target.includes(cur.source)) continue;
            if (!target.includes(cur.target)) continue;
            if (!target.includes(cur.event)) continue;
            dmgText = target;
            break;
        }

        // Find raw damage value
        const uPosition = dmgText.indexOf("U:");
        if (uPosition !== -1) {
            const uSubstring = dmgText.substring(uPosition + 2);
            const uValue = parseInt(uSubstring); //??? but documentation says first number is used if happens to have multiple
            cur.unmitigatedDamage = uValue;
        } else {
            cur.unmitigatedDamage = 0;
        }

        listOfEvents.push(cur);
    }

    return listOfEvents
}

const getFFlogsTimeInSeconds = (time: string) => {
    const timeFormat = /^\d{2}:\d{2}\.\d{3}$/;
    if (timeFormat.test(time)) {
        const [minutes, rest] = time.split(":");
        const [seconds, milliseconds] = rest.split(".");

        return Math.round(Number(minutes) * 60 + Number(seconds) + Number(milliseconds) / 1000) + timeOffset.value;
    }
    return -1;
}
</script>