<template>
    <TooltipProvider v-if="median > 0">
        <Tooltip>
            <TooltipTrigger>
                <span :class="{ 'text-neutral-600': damageThreshold > 0 && damageThreshold > mitigated }">
                    {{ prettyValue }}<small
                        :class="{ 'text-muted-foreground': damageThreshold > 0 && damageThreshold < mitigated }">k</small>
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <p>Median damage: <span class="text-muted-foreground">{{ prettyfy(median, 0) }}</span></p>
                <p v-if="median > mitigated">Mitigated to: <span class="text-muted-foreground">{{ prettyfy(mitigated, 0)
                        }}</span></p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
    damageValues: Array as PropType<number[]>,
    totalMitigation: Number
})

const damageThreshold = inject('damage-threshold', 0)

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

const prettyValue = computed(() => prettyfy(Math.ceil(mitigated.value / 500) * 500 / 1000, 0))

const prettyfy = (uglyNumber: number, decimals: number) => uglyNumber.toLocaleString('en-US', { maximumFractionDigits: decimals }).replace(/,/g, ' ')
</script>