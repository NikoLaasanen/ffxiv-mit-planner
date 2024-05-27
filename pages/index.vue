<template>
    <div class="flex flex-col gap-4">
        <Timeline />
        <TimelineToolbar />
        <TimelineEditorEvent @new-event="(newEvent) => encounterStore.addTimelineEvent(newEvent)" />
        <TimelineEditorFflog @new-timeline="(newTimeline) => encounterStore.setTimeline(newTimeline)" />
    </div>
</template>

<script lang="ts" setup>
import { useEncounterStore } from '@/stores/encounter'
const encounterStore = useEncounterStore();
</script>
