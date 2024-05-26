<template>
    <span v-for="ability in abilities" :for="ability.title"
        :class="{ active: isAbilityActive(getActivePlayerAbility(ability)) }">
        <input type="checkbox" :checked="isAbilityTriggered(getActivePlayerAbility(ability))"
            :disabled="isAbilityOnCooldown(getActivePlayerAbility(ability))"
            @change="encounterStore.togglePlayerAbility(getActivePlayerAbility(ability))">
    </span>
</template>

<script lang="ts" setup>
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

<style scoped>
.active {
    background-color: lawngreen;
}
</style>