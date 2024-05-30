<template>
    <AlertDialog>
        <AlertDialogTrigger as-child>
            <Button type="button" variant="destructive" size="icon" :disabled="disabled">
                <Icon icon="radix-icons:cross-2" class="h-[1.2rem] w-[1.2rem]" /> <span class="sr-only">Clear</span>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="$.emit('clear')">Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits(['clear']);

defineProps({
    disabled: Boolean
})
</script>