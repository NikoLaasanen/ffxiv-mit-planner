<template>
    <div class="timeline">
        <div class="row">
            <div class="item">Time</div>
            <div class="item">Source</div>
            <div class="item">Cast</div>
            <div v-for="job in jobs" :key="job.abbr" class="item">
                {{ job.abbr }}<br>
                <span v-for="ability in job.abilities" :for="ability.title">
                    {{ ability.title.substring(0, 1) }}
                </span>
            </div>
        </div>
        <TimelineRow v-for="event in timeline" :item="event" />
    </div>
    <button type="button" @click="encounterStore.loadTimeline('top_p1')">Load TOP p1</button>
    <button v-for="jobAbbr in availableJobs" type="button" @click="encounterStore.toggleJob(jobAbbr)">
        Add {{ jobAbbr }}
    </button>

    <TimelineEditorEvent @new-event="(newEvent) => encounterStore.addTimelineEvent(newEvent)" />
    <TimelineEditorFflog @new-timeline="(newTimeline) => encounterStore.insertTimeline(newTimeline)" />
</template>

<script lang="ts" setup>
import { useEncounterStore } from '@/stores/encounter'
import { storeToRefs } from 'pinia'

const encounterStore = useEncounterStore();
const { timeline, jobs } = storeToRefs(encounterStore);

const availableJobs = ['PLD', 'SAM', 'DNC'] as JobAbbrevation[];
const jobCount = computed(() => jobs.value.length);
</script>
<style>
body {
    background-color: rgb(207, 207, 207);
}
</style>
<style scoped>
.timeline {
    display: grid;
    grid-template-columns: 50px 1fr 2fr repeat(v-bind(jobCount), auto);
}

.timeline .row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: span v-bind(jobCount + 3);
}

.timeline .row .item {
    border: 1px solid gray;
}
</style>