<template>
    <Card>
        <CardHeader>
            <CardTitle>Add new event to timeline</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Button type="submit" class="mt-4">Add</Button>
            </form>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

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