<template>
    <TooltipProvider v-if="shareAvailable">
        <Tooltip>
            <TooltipTrigger as-child>
                <Button @click="share" variant="ghost">
                    <Icon icon="radix-icons:paper-plane" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                Share
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useToast } from '@/components/ui/toast/use-toast'

const props = defineProps({
    title: String,
    url: String
})

const route = useRoute();

const { toast } = useToast()
const shareAvailable = computed(() =>
    // @ts-ignore: Check if share function is available
    navigator.share &&
    (props.title?.length ?? 0) > 0
);

const share = () => {
    if (navigator.share) {
        navigator.share({
            title: props.title,
            url: route.fullPath
        }).catch((error) => toast({ description: 'Share failed', variant: 'destructive' }))
    } else {
        toast({ description: 'Share not available', variant: 'destructive' })
    }
}
</script>