<template>
    <TooltipProvider :delay-duration="0">
        <Tooltip>
            <TooltipTrigger as-child>
                <Avatar v-if="iconData" class="w-6 h-6 img-contain rounded-lg">
                    <AvatarImage :src="imageSrc" :alt="iconTitle" />
                    <AvatarFallback>{{ iconTitle }}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p class="font-semibold">{{ iconTitle }}</p>
                <Separator />

                <div class="grid grid-cols-3">
                    <div v-if="abilityDuration" class="grid grid-cols-subgrid gap-2 col-span-3">
                        <div class="col-span-2">Duration:</div>
                        <div class="text-right"> {{ abilityDuration }}s</div>
                    </div>
                    <div v-if="abilityCooldown" class="grid grid-cols-subgrid gap-2 col-span-3">
                        <div class="col-span-2">Cooldown:</div>
                        <div class="text-right">{{ abilityCooldown }}s</div>
                    </div>
                </div>
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
const abilityCooldown = computed(() => (props.iconData as JobAbility)?.cooldown ?? 0);
</script>