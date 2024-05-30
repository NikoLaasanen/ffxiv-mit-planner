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
        <div class="flex justify-between">
            <span>{{ title }}</span>
            <Button @click="editTitle = true">
                <Icon icon="radix-icons:pencil-1" class="h-[1.2rem] w-[1.2rem]" /> Edit title
            </Button>
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