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

        for (const row of rawData.value.split('\n')) {
            const rowData = row.match(/"(.*?)"/g)?.map(item => item.replace(/"/g, ''));
            if (rowData?.length === 3) {
                const timeStr = rowData[0];
                const eventStr = rowData[1];
                if (eventStr.includes(" prepares ")) {
                    let [abilitySource, abilityTitle, abilityTarget] = eventStr.split('  ');
                    abilitySource = abilitySource.replace(" prepares", '');
                    const [firstname, lastname] = abilityTarget.substring(3).split(' ');
                    const time = getFFlogsTimeInSeconds(timeStr);

                    // If merging is enabled check last entry
                    if (mergeBy.value !== "none" && timeline.length > 0) {
                        const lastEntry = timeline[timeline.length - 1];
                        if (mergeBy.value === "time" && lastEntry.time === time) {
                            if (lastEntry.source !== abilitySource) {
                                lastEntry.source = "Multiple sources";
                            }
                            continue;
                        } else if ((mergeBy.value === "time-source" && lastEntry.source === abilitySource) ||
                            (mergeBy.value === "both" && lastEntry.time === time && lastEntry.source === abilitySource)) {
                            continue;
                        }
                    }

                    timeline.push({
                        time: time, source: abilitySource, ability: {
                            title: abilityTitle,
                            damageType: 'magical'
                        } as BossAbility
                    } as TimelineEvent)
                }
            }
        }

        rawData.value = '';
        emit('newTimeline', timeline);
    }
};

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