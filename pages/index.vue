<template>
    <div class="flex flex-col gap-4">
        <Card>
            <CardHeader>
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
                    <TimelineLoader @change:timeline="newTimeline => planStore.setTimeline(newTimeline)" />
                </div>
            </CardContent>
        </Card>

        <Button type="button" @click="savePlan" :disabled="!canSave || isSavingPlan">
            <template v-if="isSavingPlan">
                <LoadingIcon />
            </template>
            <template v-else>Save</template>
        </Button>

        <!--
        <TimelineEditorEvent @new-event="newEvent => planStore.addTimelineEvent(newEvent)" />
        <TimelineEditorFflog @new-timeline="timelineEvents => planStore.setTimelineEvents(timelineEvents)" />
        -->
    </div>
</template>

<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const canSave = computed(() => (plan.value.timeline?.id?.length ?? 0) > 0 && (plan.value.activeAbilities?.length ?? 0) > 0)

const {
    execute: savePlan,
    isLoading: isSavingPlan
} = useAsyncState(
    () => {
        if (!canSave.value) {
            return Promise.reject(new Error('Saving prevented'))
        }

        return addDoc(planRef, {
            title: planTitle.value,
            timeline: doc(timelineRef, plan.value.timeline.id),
            activeAbilities: plan.value.activeAbilities.map(obj => {
                let newData = { ...obj };
                // @ts-ignore: Create reference to document for db update
                newData.ability = doc(jobAbilityRef, obj.ability.title.toLowerCase())
                return newData;
            })
        }).then(() => {
            toast({ description: 'Plan saved' });
        }).catch(() => {
            toast({ description: 'Saving failed', variant: 'destructive' });
        })
    },
    null,
    { immediate: false }
)
</script>
