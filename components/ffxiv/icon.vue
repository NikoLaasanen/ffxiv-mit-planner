<template>
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger as-child>
                <Avatar v-if="iconData" class="w-6 h-6 img-contain rounded-lg">
                    <AvatarImage :src="imageSrc" :alt="iconTitle" />
                    <AvatarFallback v-if="isLB">{{ iconTitle.charAt(iconTitle.length - 1) }}</AvatarFallback>
                    <AvatarFallback v-else>{{ iconTitle }}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent v-if="abilityCooldown > 0" class="p-0">
                <FfxivJobAbilityCard v-if="abilityCooldown > 0" :ability="(iconData as JobAbility)" />
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

const abilityCooldown = computed(() => (props.iconData as JobAbility)?.cooldown ?? 0);
const isLB = computed(() => iconTitle.value.includes("Limit Break "))
</script>