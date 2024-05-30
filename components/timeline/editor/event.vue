<template>
    <form @submit.prevent="onSubmit">
        <Label for="new-event-time">Time</Label>
        <Input type="number" id="new-event-time" v-model="time" />
        <Label for="new-event-source">Source</Label>
        <Input type="text" id="new-event-source" v-model="source" />
        <Label for="new-event-title">Title</Label>
        <Input type="text" id="new-event-title" v-model="title" />
        <Label for="new-event-damage-type">Damage type</Label>
        <Select id="new-event-damage-type" v-model="damageType">
            <SelectTrigger>
                <SelectValue placeholder="Select damage type" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="magical">Magical</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
        <Button type="submit" class="mt-4" :disabled="!canSubmit">Add</Button>
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

const canSubmit = computed(() => title.value.length > 0 && source.value.length > 0)

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