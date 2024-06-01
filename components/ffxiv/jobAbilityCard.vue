<template>
    <Card v-if="ability" class="p-2">
        <CardHeader class="p-0 mb-2">
            <CardTitle class="flex justify-between text-sm font-semibold">
                {{ ability.title }}
                <FfxivIcon :icon-data="ability" />
            </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
            <div class="grid grid-cols-2 text-sm text-muted-foreground">
                <span>Duration:</span><span class="text-right">{{ ability.duration }}s</span>
                <span>Cooldown:</span><span class="text-right">{{ ability.cooldown }}s</span>
                <span>Type:</span><span class="text-right">{{ ability.type }}</span>
                <span><Label :for="'jobability-' + abilityId" class="font-normal">Hide:</Label></span><span
                    class="text-right">
                    <Checkbox :id="'jobability-' + abilityId" :checked="preferencesStore.isAbilityInHiddens(ability)"
                        @click="preferencesStore.toggleJobAbilityVisibility(ability)" />
                </span>
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
const emit = defineEmits(['change:visibility']);

const preferencesStore = usePreferencesStore();

const props = defineProps({
    ability: Object as PropType<JobAbility>,
    editVisibility: {
        type: Boolean,
        required: false,
        default: false
    }
})

const abilityId = computed(() => props.ability?.title.replace(' ', '_'));

useSeoMeta({
    title: 'Jobs & abilities - FFXIV mitigation planner'
})
</script>