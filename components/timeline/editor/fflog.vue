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

    <template v-if="addingMethod !== 'hide'">
        <Label for="fflogs-import-adding-method">Choose adding method:</Label>
        <Select id="fflogs-import-adding-method" v-model="addingMethod">
            <SelectTrigger>
                <SelectValue placeholder="Select merge method" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="merge">Merge</SelectItem>
                    <SelectItem value="replace">Replace</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>

        <template v-if="addingMethod === 'merge' && timeOffset === 0">
            <div class="my-2 items-top flex gap-x-2">
                <Checkbox id="fflogs-import-merge-auto-adjust-offset" :checked="autoAjustOffset"
                    @click="autoAjustOffset = !autoAjustOffset" />
                <div class="grid gap-1.5 leading-none">
                    <label for="fflogs-import-merge-auto-adjust-offset"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Automatically adjust offset
                    </label>
                </div>
            </div>
        </template>
        <template v-else-if="addingMethod === 'replace'">
            <Label for="fflogs-import-time-offset">Start replacing from (s):</Label>
            <Input type="number" id="fflogs-import-time-offset" v-model="replaceStart" />
        </template>
    </template>

    <Button class="mt-4" @click="doParse" :disabled="rawData.trim().length === 0">Import</Button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
    (e: 'newTimeline', timelineEvents: TimelineEvent[], addingMethod: string, autoAdjust: boolean, replaceStart: number): void
}>()

const props = defineProps({
    defaultAddingMethod: String as PropType<'hide' | 'merge' | 'replace'>
})

const rawData = ref('');
const mergeBy = ref('time');
const timeOffset = ref(0);
const addingMethod = ref(props.defaultAddingMethod)
const autoAjustOffset = ref(true);
const replaceStart = ref(0)

const applyAutoAdjust = computed(() => autoAjustOffset.value && timeOffset.value === 0)

const doParse = () => {
    if (rawData.value.trim().length > 0) {
        // Transform fflogs data to a more easily readable array
        const mergedData = [] as ImportedData[];
        const prettyData = getBetterCsvData(rawData.value.split('\n'));

        for (let i = 0; i < prettyData.length; i++) {
            const row = prettyData[i];

            if (mergeBy.value !== "none" && i > 1) {
                const lastEntry = mergedData[mergedData.length - 1];
                // Merge: time
                if ((mergeBy.value === "time" && lastEntry.event === row.event && lastEntry.timestamp === row.timestamp)) {
                    lastEntry.unmitigatedDamage.push(...row.unmitigatedDamage)
                    lastEntry.unmitigatedDamage.sort();
                    if (!lastEntry.source.includes(row.source[0])) {
                        lastEntry.source.push(row.source[0]);
                    }
                    continue;
                }
                // Merge: time and source
                else if (mergeBy.value === "time-source" && lastEntry.event === row.event && lastEntry.timestamp === row.timestamp && lastEntry.source === row.source) {
                    lastEntry.unmitigatedDamage.push(...row.unmitigatedDamage)
                    lastEntry.unmitigatedDamage.sort();
                    continue;
                }
            }
            mergedData.push(row);
        }
        console.log(mergedData)

        const timeline = [] as TimelineEvent[];
        for (const row of mergedData) {
            timeline.push({
                time: getTimeInSeconds(row.timestamp),
                source: row.source.length > 1 ? `Multiple sources` : row.source[0],
                sourceCount: row.source.length,
                ability: {
                    title: row.event,
                    damageType: 'magical',
                    unmitigatedDamage: row.unmitigatedDamage
                } as BossAbility
            } as TimelineEvent);
        }

        rawData.value = '';
        emit('newTimeline',
            timeline,
            addingMethod.value ?? 'merge',
            applyAutoAdjust.value,
            replaceStart.value
        );
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

        cur.timestamp = getFFlogsTimeinMilliseconds(line.substring(timeStart + 1, timeEnd));
        event = line.substring(eventStart + 1, eventEnd);

        // Find source, event, target
        let regex = /(?<source>.*?) prepares (?<event>.*?) on ( \d+|--)?(?<remaining>.*)?/;
        let match = event.match(regex);
        let regex2 = /(?<firstname>\w+)\s(?<lastname>\w+)([\s-+\(].*)?/;
        const remainingText = match?.groups?.remaining ?? '';
        let match2 = (remainingText).match(regex2);
        cur.source = [match?.groups?.source.trim() ?? ''];
        cur.event = match?.groups?.event.trim() ?? '';
        cur.target = `${match2?.groups?.firstname.trim() ?? ''} ${match2?.groups?.lastname.trim() ?? ''}`;
        cur.unmitigatedDamage = [];

        // Add damage values only if target has no vulnerability
        if (!remainingText.includes('+')) {
            // Find matching damage text
            let dmgText = "";
            for (let i2 = i + 1; i2 < allLines.length; i2++) {
                const target = allLines[i2];
                if (!target.includes(cur.source[0])) continue;
                if (!target.includes(cur.target)) continue;
                if (!target.includes(cur.event)) continue;
                dmgText = target;
                break;
            }

            // Find raw damage value
            const uPosition = dmgText.indexOf("U:");
            if (uPosition !== -1) {
                const uSubstring = dmgText.substring(uPosition + 2);
                const regex = /\+\d+%/;
                if (!regex.test(uSubstring)) {
                    const uValue = parseInt(uSubstring); //??? but documentation says first number is used if happens to have multiple
                    cur.unmitigatedDamage.push(uValue);
                }
            }
        }

        listOfEvents.push(cur);
    }

    return listOfEvents
}

const getFFlogsTimeinMilliseconds = (time: string) => {
    const timeFormat = /^\d{2}:\d{2}\.\d{3}$/;
    if (timeFormat.test(time)) {
        const [minutes, rest] = time.split(":");
        const [seconds, milliseconds] = rest.split(".");
        const ms = Number(minutes) * 60000 + Number(seconds) * 1000 + Number(milliseconds);
        return Math.round(ms / 10) * 10;
    }
    return -1;
}

const getTimeInSeconds = (timestamp: number) => {
    if (timestamp >= 0) {
        return Math.round(timestamp / 1000) + timeOffset.value;
    }
    return -1;
}
</script>