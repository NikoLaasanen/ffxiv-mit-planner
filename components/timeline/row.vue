<template>
    <div v-if="item" class="row">
        <div class="item">{{ timeInMinutes }}</div>
        <div class="item">{{ item.source }}</div>
        <div class="item">{{ item.ability.title }}</div>
        <div v-for="job in jobs" :key="job.abbr" class="item">
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
.row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1/-1;
}

.row:hover {
    background-color: bisque;
}

.row .item {
    border: 1px solid gray;
}
</style>