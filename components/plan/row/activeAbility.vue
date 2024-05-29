<template>
    <span class="w-6 h-6 flex items-center justify-center">
        <Icon v-if="isActive" icon="radix-icons:check" />
        <Checkbox v-else :checked="isChecked" :disabled="isDisabled" />
    </span>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits(['change:ability']);

const props = defineProps({
    time: Number,
    owner: String as PropType<JobAbbrevation>,
    ability: Object as PropType<JobAbility>,
    activeAbilities: Array as PropType<ActiveAbility[]>
});

const rowTime = computed(() => props.time ?? 0)
const activationBuffer = ref(2);

const isActive = computed(() => props.activeAbilities?.some(item => {
    if (item.source === props.owner && item.ability.title === props.ability?.title) {
        return rowTime.value > item.time &&
            rowTime.value < item.time + item.ability.duration - activationBuffer.value
    } else {
        return false;
    }
}));

const isChecked = computed(() => props.activeAbilities?.some(item =>
    item.time === rowTime.value &&
    item.source === props.owner &&
    item.ability.title === props.ability?.title
));

const isDisabled = computed(() => props.activeAbilities?.some(item => {
    if (item.source === props.owner && item.ability.title === props.ability?.title) {
        return (rowTime.value > item.time && rowTime.value < item.time + item.ability.cooldown) ||
            (rowTime.value < item.time && rowTime.value > item.time - item.ability.cooldown)
    } else {
        return false;
    }
}));


</script>