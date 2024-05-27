<template>
    <div class="flex flex-col gap-4">
        <Timeline />
    </div>
</template>

<script lang="ts" setup>
import { collection, doc } from 'firebase/firestore'

const route = useRoute();
const db = useFirestore();

const timelineSource = computed(() =>
    doc(collection(db, 'timeline'), String(route.params.id))
)

const timeline = useDocument<Timeline>(timelineSource);

if (timeline.value?.events) {
    const encounterStore = useEncounterStore();
    encounterStore.setTimeline(timeline.value?.events);
}
</script>