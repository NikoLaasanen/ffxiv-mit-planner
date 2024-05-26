<template>
    <Card>
        <CardHeader class="pb-0">
            <CardTitle class="sr-only">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
            <ScrollArea class="h-[400px] rounded-md border p-4">
                <div class="timeline p-2 grid">
                    <div class="bg-card z-10 sticky top-0 grid grid-cols-subgrid gap-x-3 pb-1 mb-1 border-b-2">
                        <div class="font-semibold self-end">Time</div>
                        <div class="font-semibold self-end">Source</div>
                        <div class="font-semibold self-end">Cast</div>
                        <div v-for="job in jobs" :key="job.abbr" class="flex gap-1 flex-col items-center">
                            <FfxivIcon :icon-data="job" />
                            <div class="flex gap-1">
                                <FfxivIcon v-for="ability in job.abilities" :for="ability.title" :icon-data="ability" />
                            </div>
                        </div>
                    </div>
                    <TimelineRow v-for="event in timeline" :item="event" />
                </div>
            </ScrollArea>
            <div class="mt-2 flex gap-2">
                <Button type="button" @click="encounterStore.loadTimeline('top_p1')">Load TOP p1</Button>
                <Button v-for="jobAbbr in availableJobs" type="button" @click="encounterStore.toggleJob(jobAbbr)">
                    Add {{ jobAbbr }}
                </Button>
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useEncounterStore } from '@/stores/encounter'
import { storeToRefs } from 'pinia'

const encounterStore = useEncounterStore();
const { timeline, jobs } = storeToRefs(encounterStore);

const jobCount = computed(() => jobs.value.length);
const availableJobs = ['PLD', 'SAM', 'DNC'] as JobAbbrevation[];
</script>

<style scoped>
.timeline {
    grid-template-columns: 50px 1fr 2fr repeat(v-bind(jobCount), auto);
}

.timeline>.grid-cols-subgrid {
    grid-column: span v-bind(jobCount + 3);
}
</style>