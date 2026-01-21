<template>
    <span v-if="colMistakes.length > 0" class="w-6 h-6 flex items-center justify-center">
        <img v-for="mistake in cellMistakes" :key="mistake.type" :src="getMistakeIconSrc(mistake)" :alt="mistake.type"
            class="h-5 w-5" :title="mistake.type" />
    </span>
</template>

<script lang="ts" setup>
import { usePlanStore } from '@/stores/plan'

const planStore = usePlanStore();

const props = defineProps({
    time: Number,
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
    return colMistakes.value.filter(mistake => {
        return mistake.timestamp <= rowTime.value && (mistake.timestamp + mistake.duration) > rowTime.value;
    });
});

const getMistakeIconSrc = (mistake: PlayerMistake) => {
    switch (mistake.type) {
        case 'Damage Down':
            return 'https://xivapi.com/i/015000/015520.png';
        case 'Weakness':
            return 'https://xivapi.com/i/015000/015010.png';
        case 'Brink of Death':
            return 'https://xivapi.com/i/015000/015011.png';
        default:
            return '';
    }
};
</script>