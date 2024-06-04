<template>
    <TooltipProvider v-if="median > 0">
        <Tooltip>
            <TooltipTrigger>
                {{ prettyValue }}<small class="text-muted-foreground">k</small>
            </TooltipTrigger>
            <TooltipContent>
                <p>Median damage: {{ prettyfy(median) }}</p>
                <p>Mitigated to: {{ prettyfy(mitigated) }}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
const props = defineProps({
    damageValues: Array as PropType<number[]>,
    totalMitigation: Number
})

const sorted = computed(() => props.damageValues?.filter(Boolean).sort() ?? [])

const median = computed(() => {
    const mid = Math.floor(sorted.value.length / 2);
    if (sorted.value.length % 2) {
        return sorted.value[mid];
    } else {
        return (sorted.value[mid - 1] + sorted.value[mid]) / 2.0;
    }
})

const mitigated = computed(() => median.value * (1 - (props.totalMitigation ?? 0) / 100))

const prettyValue = computed(() => prettyfy(Math.ceil(mitigated.value / 500) * 500 / 1000))

const prettyfy = (uglyNumber: number) => uglyNumber.toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, ' ')
</script>