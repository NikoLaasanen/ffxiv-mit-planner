<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child>
                <Avatar v-if="iconData" class="w-6 h-6 img-contain rounded-lg">
                    <AvatarImage :src="imageSrc" :alt="iconTitle" />
                    <AvatarFallback>{{ iconTitle }}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent v-if="abilityDuration > 0" class="p-0">
                <FfxivJobAbilityCard v-if="abilityDuration > 0" :ability="(iconData as JobAbility)" />
            </TooltipContent>
            <TooltipContent v-else>
                {{ iconTitle }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
const props = defineProps({
    iconData: Object as PropType<Job | JobAbility>
});

const imageSrc = computed(() => props.iconData?.icon ?? "");
const iconTitle = computed(() => props.iconData?.title ?? "");

const abilityDuration = computed(() => (props.iconData as JobAbility)?.duration ?? 0);
</script>