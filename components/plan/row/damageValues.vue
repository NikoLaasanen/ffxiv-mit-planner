<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <span :class="{ 'text-neutral-600': damageThreshold > 0 && damageThreshold > mitigated }">
                    <template v-if="!median || median <= 0">0</template>
                    <template v-else>
                        {{ prettyValue }}
                    </template>
                    <small
                        :class="{ 'text-muted-foreground': damageThreshold > 0 && damageThreshold < mitigated }">k</small>
                </span>
            </TooltipTrigger>
            <TooltipContent>
                <template v-if="!median || median <= 0">
                    <p>No valid damage values added yet</p>
                </template>
                <template v-else>
                    <p>Median: <span class="text-muted-foreground">{{ prettyfy(median, 0) }}</span></p>
                    <p v-if="median > mitigated">
                        Mitigated to: <span class="text-muted-foreground">{{ prettyfy(mitigated, 0) }}</span>
                    </p>
                </template>

                <template v-if="(damageValues?.length ?? 0) > 0">
                    <Separator class="my-2" />
                    <Button @click="showDetailedValues = !showDetailedValues" variant="outline">
                        <span v-if="!showDetailedValues">Open detailed values
                            <span class="text-muted-foreground">({{ damageValues?.length }})</span>
                        </span>
                        <span v-else>Hide detailed values</span>
                    </Button>
                    <div v-if="showDetailedValues">
                        <p class="mt-2">Damage values:</p>
                        <ul>
                            <li v-for="(dmgVal, key) in damageValues" :key="key"
                                class="flex items-center justify-between text-muted-foreground group">
                                {{ dmgVal }}
                                <Icon @click="$.emit('remove:damageValue', key)" icon="radix-icons:cross-2"
                                    class="hidden group-hover:inline-flex text-neutral-600 hover:text-neutral-100 cursor-pointer" />
                            </li>
                        </ul>

                        <div class="flex gap-2 mt-2">
                            <Input v-model="newDamageValue" type="number" placeholder="Add new value" />
                            <Button @click="$.emit('add:damageValue', newDamageValue)">
                                <Icon icon="radix-icons:plus" lass="h-[1rem] w-[1rem]" />
                            </Button>
                        </div>
                    </div>
                </template>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
    (e: 'remove:damageValue', key: number): void,
    (e: 'add:damageValue', newValue: number): void,
}>()

const props = defineProps({
    damageValues: Array as PropType<number[]>,
    totalMitigation: Number
})

const showDetailedValues = ref(false);
const newDamageValue = ref(0);

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