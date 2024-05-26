<template>
    <span v-for="ability in abilities" :for="ability.title" class="w-6 h-6 flex items-center justify-center">
        <Icon v-if="isAbilityActive(getActivePlayerAbility(ability))" icon="radix-icons:check" />
        <Checkbox v-else :checked="isAbilityTriggered(getActivePlayerAbility(ability))"
            :disabled="isAbilityOnCooldown(getActivePlayerAbility(ability))"
            @click="encounterStore.togglePlayerAbility(getActivePlayerAbility(ability))" />
    </span>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
    time: Number,
    owner: String as PropType<JobAbbrevation>,
    abilities: Array as PropType<JobAbility[]>
});

const encounterStore = useEncounterStore();
const { isAbilityTriggered, isAbilityActive, isAbilityOnCooldown } = storeToRefs(encounterStore);

const getActivePlayerAbility = (ability: JobAbility) => {
    return { activation: props.time, owner: props.owner, ability: ability } as ActivePlayerAbility
}
</script>