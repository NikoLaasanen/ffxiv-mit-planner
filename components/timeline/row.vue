<template>
    <div v-if="item" class="grid grid-cols-subgrid gap-x-3 hover:bg-muted">
        <div>{{ timeInMinutes }}</div>
        <div>{{ item.source }}</div>
        <div>{{ item.ability.title }}</div>
        <div v-for="job in jobs" :key="job.abbr" class="flex gap-1">
            <TimelinePlayerAbility :abilities="job.abilities" :time="item.time" :owner="job.abbr" />
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    item: Object as PropType<TimelineEvent>
});

const encounterStore = useEncounterStore();
const { jobs } = storeToRefs(encounterStore);
const jobCount = computed(() => jobs.value.length);

const timeInMinutes = computed(() => {
    const seconds = props.item?.time ?? 0;
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    let formattedTime = minutes + ':';
    // Pad the seconds with a zero if it's less than 10
    if (remainingSeconds < 10) {
        formattedTime += '0' + remainingSeconds;
    } else {
        formattedTime += remainingSeconds;
    }

    return formattedTime;
});
</script>

<style scoped>
.grid-cols-subgrid {
    grid-column: span v-bind(jobCount + 3);
}
</style>