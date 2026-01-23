<template>
    <div class="flex flex-col gap-2">
        <Skeleton class="h-[400px] w-100 rounded-xl" />
        <div class="flex gap-2">
            <Skeleton v-for="job in jobs" :key="job.abbr" class="h-[40px] w-[56px]" />
        </div>
        <Skeleton class="h-4 w-[200px]" />
        <LoadingIcon class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
</template>

<script lang="ts" setup>
import { JobKey } from '~/injectionkeys'
const jobs = inject(JobKey, null)
</script>