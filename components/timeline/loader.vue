<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <Button role="combobox" :aria-expanded="open" class="justify-between">
                {{ title }}
                <Icon icon="radix-icons:caret-sort" class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[200px] p-0">
            <Command v-model="selection">
                <CommandInput placeholder="Search encounter..." />
                <CommandEmpty>No encounter found.</CommandEmpty>
                <CommandList>
                    <CommandGroup v-for="(group) in groups" :key="group.title" :heading="group.title">
                        <CommandItem v-for="timeline in group.timelines" :key="timeline.id" :value="timeline.title"
                            @select="selectTimeline(timeline)">
                            {{ timeline.title }}
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>
        </PopoverContent>
    </Popover>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { collection, query, where } from 'firebase/firestore'

const emit = defineEmits<{
    (e: 'change:timeline', timeline: Timeline): void
}>()

defineProps({
    title: {
        type: String,
        required: false,
        default: 'Select template'
    }
})

const open = ref(false);
const selection = ref('');

const db = useFirestore();
const timelinesRef = collection(db, 'timeline');
const timelinesQuery = query(timelinesRef, where('tpl', '==', true));
const timelines = useCollection(timelinesQuery, { ssrKey: 'timelineLoader' });

const groups = computed(() => {
    const grouped = timelines.value.reduce((result, obj) => {
        const key = getContentTypeTitle(obj.contentType);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(obj);
        return result;
    }, {})
    return Object.keys(grouped).map(key => {
        return { title: key, timelines: grouped[key] };
    });
});

const getContentTypeTitle = (contentType: ContentType) => {
    switch (contentType) {
        case 'expert':
        case 'savage':
        case 'ultimate':
            return contentType.charAt(0).toUpperCase() + contentType.slice(1) + 's';
        default:
            return 'Misc';
    }
}

const selectTimeline = (timeline: Timeline) => {
    open.value = false;
    emit('change:timeline', timeline);
}
</script>