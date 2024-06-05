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

        cur.timestamp = line.substring(timeStart + 1, timeEnd);
        event = line.substring(eventStart + 1, eventEnd);

        // Find source, event, target
        let regex = /(?<source>.*?) prepares (?<event>.*?) on ( \d+|--)?(?<remaining>.*)?/;
        let match = event.match(regex);
        let regex2 = /(?<firstname>\w+)\s(?<lastname>\w+)([\s-+\(].*)?/;
        const remainingText = match?.groups?.remaining ?? '';
        let match2 = (remainingText).match(regex2);
        cur.source = match?.groups?.source.trim() ?? '';
        cur.event = match?.groups?.event.trim() ?? '';
        cur.target = `${match2?.groups?.firstname.trim() ?? ''} ${match2?.groups?.lastname.trim() ?? ''}`;
        cur.unmitigatedDamage = 0;
        console.log(cur)

        // Add damage values only if target has no vulnerability
        if (!remainingText.includes('+')) {
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
                const regex = /\+\d+%/;
                if (!regex.test(uSubstring)) {
                    const uValue = parseInt(uSubstring); //??? but documentation says first number is used if happens to have multiple
                    cur.unmitigatedDamage = uValue;
                }
            }
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