<template>
    <span v-if="mistakeSummary.length > 0" class="flex items-center justify-center gap-1">
        <div v-for="summary in mistakeSummary" :key="summary.type" class="flex items-center gap-0.5">
            <img :src="getMistakeIconSrc(summary.type)" :alt="summary.type" class="h-5 w-5" :title="summary.type" />
            <small>x{{ summary.count }}</small>
        </div>
    </span>
</template>

<script lang="ts" setup>
import { usePlanStore } from '@/stores/plan'
import useMistakes from '@/composables/useMistakes'

const planStore = usePlanStore();
const { getMistakeIconSrc } = useMistakes();

const props = defineProps({
    time: Number,
    nextEventTime: Number,
    owner: String as PropType<JobAbbrevation>
});

const { mistakes } = storeToRefs(planStore)
const rowTime = computed(() => props.time ?? 0)

const rowMistakes = computed<PlayerMistake[]>(() => {
    return mistakes.value.filter(mistake => {
        return mistake.timestamp >= rowTime.value && (!props.nextEventTime || mistake.timestamp < props.nextEventTime);
    });
});

interface MistakeSummary {
    type: MistakeType;
    count: number;
}
const mistakeSummary = computed<MistakeSummary[]>(() => {
    const summary: MistakeSummary[] = [];
    rowMistakes.value.forEach(mistake => {
        const existing = summary.find(item => item.type === mistake.type);
        if (existing) {
            existing.count++;
        } else {
            summary.push({ type: mistake.type, count: 1 });
        }
    });

    // Sort deaths first
    summary.sort((a, b) => {
        if (a.type === 'Death') return -1;
        if (b.type === 'Death') return 1;
        return 0;
    });

    return summary;
});
</script>