<template>
    <span v-if="colMistakes.length > 0" class="w-6 h-6 flex items-center justify-center">
        <img v-for="mistake in cellMistakes" :key="mistake.type" :src="getMistakeIcon(mistake)" :alt="mistake.type"
            class="h-5 w-5" :title="mistake.type" />
    </span>
</template>

<script lang="ts" setup>
import { usePlanStore } from '@/stores/plan'
import useMistakes from '@/composables/useMistakes'

const planStore = usePlanStore();
const { getMistakeIcon } = useMistakes();

const props = defineProps({
    time: Number,
    nextEventTime: Number,
    owner: String as PropType<JobAbbrevation>
});

const { mistakes } = storeToRefs(planStore)
const rowTime = computed(() => props.time ?? 0)

const colMistakes = computed<PlayerMistake[]>(() => {
    return mistakes.value.filter(mistake => {
        return mistake.source === props.owner;
    });
})
const cellMistakes = computed<PlayerMistake[]>(() => {
    const thisCell = colMistakes.value.filter(mistake => {
        if (mistake.type === 'Death') {
            // For death, only show if it matches the exact time
            return mistake.timestamp >= rowTime.value && (!props.nextEventTime || mistake.timestamp < props.nextEventTime);
        }
        return mistake.timestamp <= rowTime.value && (mistake.timestamp + mistake.duration) > rowTime.value;
    });
    // filter out duplicates by type
    const uniqueMistakes: PlayerMistake[] = [];
    thisCell.forEach(mistake => {
        if (!uniqueMistakes.find(m => m.type === mistake.type)) {
            uniqueMistakes.push(mistake);
        }
    });
    // If contains death, only show death
    if (uniqueMistakes.find(m => m.type === 'Death')) {
        return uniqueMistakes.filter(m => m.type === 'Death');
    }
    return uniqueMistakes;
});
</script>