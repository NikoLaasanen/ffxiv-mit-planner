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
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
defineProps({
    ability: Object as PropType<JobAbility>
})

useSeoMeta({
    title: 'Jobs & abilities - FFXIV mitigation planner'
})
</script>