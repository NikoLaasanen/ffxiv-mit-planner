<template>
    <Card v-if="ability" class="p-2">
        <CardHeader class="p-0 mb-2">
            <CardTitle class="flex justify-between text-sm font-semibold">
                {{ ability.title }}
                <FfxivIcon v-if="!ability.title.includes('Limit Break')" :icon-data="ability" />
            </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
            <div class="grid grid-cols-2 text-sm text-muted-foreground">
                <span>Duration:</span><span class="text-right">{{ ability.duration }}s</span>
                <template v-if="!ability.title.includes('Limit Break')">
                    <span>Cooldown:</span><span class="text-right">{{ ability.cooldown }}s</span>
                </template>
                <span>Type:</span><span class="text-right">{{ ability.type }}</span>
                <template v-if="!ability.title.includes('Limit Break')">
                    <span>
                        <Label :for="'jobability-' + abilityId" class="font-normal">Hide:</Label></span><span
                        class="text-right">
                        <Checkbox :id="'jobability-' + abilityId"
                            :checked="preferencesStore.isAbilityInHiddens(ability)"
                            @click="preferencesStore.toggleJobAbilityVisibility(ability)" />
                    </span>
                </template>
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
const emit = defineEmits(['change:visibility']);

const preferencesStore = usePreferencesStore();

const props = defineProps({
    ability: Object as PropType<JobAbility>
})

const abilityId = computed(() => props.ability?.title.replace(' ', '_'));
</script>