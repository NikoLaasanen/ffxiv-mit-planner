<template>
    <form @submit.prevent="onSubmit">
        <label for="new-event-time">Time</label>
        <input type="number" id="new-event-time" v-model="time">
        <label for="new-event-source">Source</label>
        <input type="text" id="new-event-source" v-model="source">
        <label for="new-event-title">Title</label>
        <input type="text" id="new-event-title" v-model="title">
        <label for="new-event-damage-type">Damage type</label>
        <select id="new-event-damage-type" v-model="damageType">
            <option value="none">None</option>
            <option value="magical">Magical</option>
            <option value="physical">Physical</option>
        </select>
        <input type="submit" value="Add">
    </form>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
    (e: 'newEvent', timelineEvent: TimelineEvent): void
}>()

const time = ref(0);
const title = ref("");
const source = ref("");
const damageType = ref("none" as DamageType);

const onSubmit = () => {
    emit('newEvent', {
        time: time.value,
        source: source.value,
        ability: {
            title: title.value,
            damageType: damageType.value
        } as BossAbility
    } as TimelineEvent);

    time.value = 0;
    title.value = "";
    damageType.value = "magical" as DamageType;
}
</script>