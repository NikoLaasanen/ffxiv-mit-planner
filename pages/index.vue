<template>
    <div class="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardDescription>
                    {{ plan.timeline.title ?? 'Custom timeline' }}
                </CardDescription>
                <CardTitle>
                    <PlanTitleEditor :title="planTitle" @update:title="newTitle => planTitle = newTitle" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Plan :timeline="plan.timeline" :active-abilities="plan.activeAbilities"
                    @change:active-ability="activation => planStore.toggleActiveAbility(activation)" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader class="pb-0">
                <CardTitle class="sr-only">New timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="flex gap-4">
                    <TimelineLoader @change:timeline="loadTimeline" />
                </div>
            </CardContent>
        </Card>

        <div class="flex gap-2">
            <Button type="button" class="grow" @click="savePlan" :disabled="!canSave || isSavingPlan">
                <template v-if="isSavingPlan">
                    <LoadingIcon />
                </template>
                <template v-else>Save</template>
            </Button>
            <PlanClearButton @clear="planStore.clearPlan" :disabled="!canSave || isSavingPlan" />
        </div>

        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TimelineEditorEvent @new-event="addNewTimelineEvent" />
            <TimelineEditorFflog @new-timeline="timelineEvents => planStore.setTimelineEvents(timelineEvents)" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast/use-toast'
import { usePlanStore } from '@/stores/plan'
import { storeToRefs } from 'pinia'
import { addDoc, collection, doc } from 'firebase/firestore'
import { JobKey } from '~/injectionkeys'

const { toast } = useToast()

// Get plan store and set initial title
const planStore = usePlanStore();
const { plan } = storeToRefs(planStore)
const planTitle = ref('My Awesome Plan');

// Create db refs
const db = useFirestore();
const jobRef = collection(db, 'job');
const planRef = collection(db, 'plan');
const timelineRef = collection(db, 'timeline');
const jobAbilityRef = collection(db, 'jobability');
// Load and provide job data
const jobs = useCollection<Job>(jobRef);
provide(JobKey, jobs);

const canSave = computed(() => (plan.value.timeline?.events?.length ?? 0) > 0 && (plan.value.activeAbilities?.length ?? 0) > 0)

const loadTimeline = (newTimeline: Timeline) => {
    planStore.setTimeline(newTimeline);
}

const addNewTimelineEvent = (newEvent: TimelineEvent) => {
    planStore.addTimelineEvent(newEvent);
    plan.value.timeline.title = 'Custom timeline';
}

const {
    execute: savePlan,
    isLoading: isSavingPlan
} = useAsyncState(
    async () => {
        if (!canSave.value) {
            return Promise.reject(new Error('Saving prevented'))
        }

        const newTimeline = plan.value.timeline;
        newTimeline.tpl = false;
        const { id } = await addDoc(timelineRef, plan.value.timeline);

        return addDoc(planRef, {
            title: planTitle.value,
            timeline: doc(timelineRef, id),
            activeAbilities: plan.value.activeAbilities.map(obj => {
                let newData = { ...obj };
                // @ts-ignore: Create reference to document for db update
                newData.ability = doc(jobAbilityRef, obj.ability.title.toLowerCase().replace(' ', '_'))
                return newData;
            })
        }).then((newPlan) => {
            toast({ description: 'Plan saved' });
            planStore.clearPlan();
            navigateTo('/plan/' + newPlan.id)
        }).catch(() => {
            toast({ description: 'Saving failed', variant: 'destructive' });
        })
    },
    null,
    { immediate: false }
)
</script>
