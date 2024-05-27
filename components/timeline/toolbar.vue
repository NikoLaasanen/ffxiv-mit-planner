<template>
    <Card>
        <CardHeader class="pb-0">
            <CardTitle class="sr-only">New timeline</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="flex gap-4">
                <TimelineEditorSave class="grow" />
                <TimelineLoader />
            </div>
        </CardContent>
    </Card>
</template>

<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>