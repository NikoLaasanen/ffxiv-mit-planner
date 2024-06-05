<template>
    <span v-if="editTitle">
        <div class="flex justify-between gap-2">
            <Label for="edit-plan-title" class="sr-only">Plan title</Label>
            <Input type="text" id="edit-plan-title" v-model="newTitle" />
            <Button @click="saveTitle" size="icon" :disabled="newTitle?.length === 0">
                <Icon icon="radix-icons:check" class="h-[1.2rem] w-[1.2rem]" /> <span class="sr-only">Save</span>
            </Button>
            <Button @click="closeTitleEditor" variant="destructive" size="icon">
                <Icon icon="radix-icons:cross-2" class="h-[1.2rem] w-[1.2rem]" /> <span class="sr-only">Cancel</span>
            </Button>
        </div>
    </span>
    <span v-else>
        <div class="flex items-center gap-2 group grow py-2">
            <span>{{ title }}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Icon @click="editTitle = true" icon="radix-icons:pencil-1"
                            class="h-[1.2rem] w-[1.2rem] text-neutral-600 hover:text-neutral-100 hidden group-hover:inline-flex cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit title</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </span>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
    (e: 'update:title', title: string): void
}>()

const props = defineProps({
    title: String
})

const editTitle = ref(false);
const newTitle = ref(props.title)

const closeTitleEditor = () => {
    editTitle.value = false;
    newTitle.value = props.title;
}

const saveTitle = () => {
    if (newTitle.value && newTitle.value?.length > 0) {
        editTitle.value = false;
        emit('update:title', newTitle.value);
    }
}
</script>