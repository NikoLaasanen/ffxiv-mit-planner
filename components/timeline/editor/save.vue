<template>
    <div class="flex gap-4">
        <Label for="timeline-title" class="sr-only">Title</Label>
        <Input id="timeline-title" placeholder="Title" v-model="timelineTitle" disabled />
        <Button type="button" @click="save" disabled>Save</Button>
    </div>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEncounterStore } from '@/stores/encounter'
import { addDoc, collection } from 'firebase/firestore'

const encounterStore = useEncounterStore();
const timelineTitle = ref('');

const save = () => {
    const db = useFirestore();
    const { timeline } = storeToRefs(encounterStore);

    addDoc(collection(db, 'timeline'), {
        title: timelineTitle.value,
        events: timeline.value
    });
}
</script>