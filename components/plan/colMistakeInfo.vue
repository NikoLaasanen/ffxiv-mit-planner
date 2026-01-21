<template>
    <TooltipProvider v-if="colMistakes.length > 0">
        <Tooltip>
            <TooltipTrigger as-child>
                <span class="w-6 h-6 flex items-center justify-center">
                    <img src="https://xivapi.com/i/015000/015520.png" alt="Mistake" class="h-5 w-5" />
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <ul>
                    <li v-for="mistake in colMistakes" :key="mistake.type">
                        {{ mistake.type }}: {{ timeInMinutes(mistake.timestamp) }}
                    </li>
                </ul>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import { usePlanStore } from '@/stores/plan'

const planStore = usePlanStore();

const props = defineProps({
    owner: String as PropType<JobAbbrevation>
});

const { mistakes } = storeToRefs(planStore)

const colMistakes = computed<PlayerMistake[]>(() => {
    const m = mistakes.value.filter(mistake => {
        return mistake.source === props.owner;
    });
    return m.sort((a, b) => a.timestamp - b.timestamp);
});

const timeInMinutes = (time: number) => {
    return String(Math.floor(time / 60)) + ':' + String(time % 60).padStart(2, '0');
};
</script>