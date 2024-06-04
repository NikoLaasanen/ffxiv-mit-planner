<template>
    {{ median }}
</template>

<script lang="ts" setup>
const props = defineProps({
    damageValues: Array as PropType<number[]>
})

const sorted = computed(() => props.damageValues?.filter(Boolean).sort() ?? [])

const median = computed(() => {
    let median = 0;
    const mid = Math.floor(sorted.value.length / 2);
    if (sorted.value.length % 2) {
        median = sorted.value[mid];
    } else {
        median = (sorted.value[mid - 1] + sorted.value[mid]) / 2.0;
    }
    return Math.round(median).toLocaleString('en-US', { maximumFractionDigits: 2 }).replace(/,/g, ' ')
})

</script>