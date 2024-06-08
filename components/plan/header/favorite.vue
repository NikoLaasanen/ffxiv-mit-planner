<template>
    <TooltipProvider v-if="planId">
        <Tooltip>
            <TooltipTrigger as-child>
                <Button variant="ghost" @click="myPlansStore.toggleFavorite(planId, planTitle ?? '')">
                    <Icon :icon="icon" class="h-[1.2rem] w-[1.2rem]"
                        :class="{ 'text-primary': myPlansStore.isFavorite(planId) }" />
                    <span class="sr-only">{{ label }}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {{ label }}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
    planId: String,
    planTitle: String
})

const myPlansStore = useMyPlansStore();

const label = computed(() =>
    props.planId && myPlansStore.isFavorite(props.planId) ? 'Remove from favorites' : 'Add to favorites'
)
const icon = computed(() =>
    props.planId && myPlansStore.isFavorite(props.planId) ? 'radix-icons:heart-filled' : 'radix-icons:heart'
)
</script>