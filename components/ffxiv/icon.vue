<template>
    <Avatar v.if="iconData" class="w-6 h-6 img-contain rounded-lg">
        <AvatarImage :src="imageSrc" alt="@radix-vue" />
        <AvatarFallback>{{ fallbackText }}</AvatarFallback>
    </Avatar>
</template>

<script lang="ts" setup>
const props = defineProps({
    iconData: Object as PropType<Job | JobAbility>
});

const imageSrc = computed(() => props.iconData?.icon ?? "");
const fallbackText = computed(() => props.iconData?.title ?? "");
</script>