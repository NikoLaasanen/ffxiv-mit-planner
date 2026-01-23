<template>
    <div id="main-content" class="flex flex-col gap-4">
        <Card v-if="isPlanLoading">
            <CardHeader>
                <CardTitle>
                    Loading timeline...
                </CardTitle>
            </CardHeader>
            <CardContent>
                <PlanSkeleton />
            </CardContent>
        </Card>
        <template v-else-if="plan.timeline.events.length > 0">
            <Card>
                <CardHeader>
                    <CardDescription>
                        {{ plan.timeline.title ?? 'Custom timeline' }}
                    </CardDescription>
                    <CardTitle>
                        <div class="flex gap-2">
                            <PlanHeaderTitleEditor :title="planTitle"
                                @update:title="(newTitle: string) => planTitle = newTitle" class="grow" />
                            <Button variant="ghost" @click="planStore.clearPlan()">
                                <Icon icon="radix-icons:reset" class="h-[1.2rem] w-[1.2rem]" /> <span
                                    class="sr-only">Back to start</span>
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Plan :timeline="plan.timeline" :active-abilities="plan.activeAbilities" :active-jobs="plan.jobs"
                        @change:activeAbility="activation => planStore.toggleActiveAbility(activation)"
                        @change:rowVisibility="timelineEvent => planStore.toggleEventVisiblity(timelineEvent)"
                        @change:damageType="(timelineEvent, newType) => planStore.setEventDamageType(timelineEvent, newType)"
                        @add:rowDamageValue="(timelineEvent, newValue) => planStore.addTimelineEventDamageValue(timelineEvent, newValue)"
                        @remove:rowDamageValue="(timelineEvent, removedKey) => planStore.removeTimelineEventDamageValue(timelineEvent, removedKey)" />
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
            <div v-if="showColMistakes">
                Looks like you have enabled showing player mistakes in the timeline. Note that player mistakes are not
                saved with
                the plan. You can view them only during the current session.
            </div>
        </template>
        <Card v-else>
            <CardContent class="p-6 bg-ffimage rounded">
                <div class="grid place-content-center gap-6 text-center">
                    <h2 class="text-6xl text-white">Welcome!</h2>
                    <div>
                        <p class="pb-2 text-white">Let's start by creating a new timeline</p>
                        <TimelineLoader @change:timeline="loadTimeline" title="Load a template" />
                    </div>
                    <div v-if="shownLatest.length > 0">
                        <Separator />
                        <p class="pb-2 text-white">My latest</p>
                        <div class="flex flex-wrap place-content-center gap-2">
                            <Button v-for="latest in shownLatest" as-child>
                                <NuxtLink :to="'/plan/' + latest.id">{{ latest.title }}</NuxtLink>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Read an FFlogs encounter</CardTitle>
                <CardDescription>Write your FFlogs encounter url with the fight ID.</CardDescription>
            </CardHeader>
            <CardContent>
                <TimelineEditorFflogsUrl @url-parsed="handleFFlogsImport" />
                <p class="text-gray-500 mt-3 text-right text-sm">You can also import from CSV logs using the <span
                        class="underline cursor-pointer" @click="showLegacyImports = !showLegacyImports">legacy
                        import</span>
                </p>
            </CardContent>
        </Card>

        <div v-if="showLegacyImports" class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Edit timeline</CardTitle>
                    <CardDescription>Load a premade timeline or add a new single event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col gap-4">
                        <Separator />
                        <p>Load a new timeline</p>
                        <TimelineLoader @change:timeline="loadTimeline" />
                        <small>Loading a new timeline will replace the old plan</small>
                        <Separator />
                        <p>Add a new event</p>
                        <TimelineEditorEvent @new-event="addNewTimelineEvent" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Import from FFlogs</CardTitle>
                    <CardDescription>Download a damage events log from FFlogs and insert the data to the textarea below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col gap-4">
                        <Separator />
                        <TimelineEditorFflogsCsv default-adding-method="hide"
                            @new-timeline="timelineEvents => planStore.setTimelineEvents(timelineEvents)" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <p class="text-sm text-gray-500 text-right">Last updated: 23.1.2026</p>
    </div>
</template>

<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { useToast } from '@/components/ui/toast/use-toast'
import { usePlanStore } from '@/stores/plan'
import { storeToRefs } from 'pinia'
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore'
import { JobKey, JobAbilityKey } from '~/injectionkeys'

const { toast } = useToast()

// Get plan store and set initial title
const planStore = usePlanStore();
const myPlansStore = useMyPlansStore();
const { latest: myLatest } = storeToRefs(myPlansStore);
const { plan, isPlanLoading } = storeToRefs(planStore)
const planTitle = ref('My Awesome Plan');
const fflogsUrl = ref('');

// Create db refs
const db = useFirestore();
const jobRef = collection(db, 'job');
const planRef = collection(db, 'plan');
const timelineRef = collection(db, 'timeline');
const jobAbilityRef = collection(db, 'jobability');
// Load and provide job data
const jobs = useCollection<Job>(jobRef);
provide(JobKey, jobs);
// Load and provide job ability data
const jobAbilities = useCollection<JobAbility>(jobAbilityRef);
provide(JobAbilityKey, jobAbilities);

const preferencesStore = usePreferencesStore();
const { showColMistakes } = storeToRefs(preferencesStore);

const shownLatest = computed(() => myLatest.value.slice(-5).reverse());
const canSave = computed(() => (plan.value.timeline?.events?.length ?? 0) > 0 && (plan.value.activeAbilities?.length ?? 0) > 0)
const showLegacyImports = ref(false)

const loadTimeline = (newTimeline: Timeline) => {
    const hasPreviousTimeline = plan.value.timeline.events.length > 0;
    planStore.setTimeline(newTimeline);
    if (!hasPreviousTimeline) {
        document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}

const addNewTimelineEvent = (newEvent: TimelineEvent) => {
    planStore.addTimelineEvent(newEvent);
    plan.value.timeline.title = 'Custom timeline';
}

const handleFFlogsImport = (newUrl: string, title: string, timelineEvents: TimelineEvent[], players: JobAbbrevation[], activeAbilities: ActiveAbility[], mistakes: PlayerMistake[]) => {
    isPlanLoading.value = true;

    // Defer store updates to next event loop so DOM can render loader first
    setTimeout(() => {
        fflogsUrl.value = newUrl;
        planStore.setTimelineEvents(timelineEvents)
        planStore.setJobs(players);
        planStore.setActiveAbilities(activeAbilities);
        planStore.setMistakes(mistakes);
        plan.value.timeline.title = title;
        isPlanLoading.value = false;
    }, 0)
}

const {
    execute: savePlan,
    isLoading: isSavingPlan
} = useAsyncState(
    async () => {
        if (!canSave.value) {
            return Promise.reject(new Error('Saving prevented'))
        }

        const { id } = await addDoc(timelineRef, plan.value.timeline);

        return addDoc(planRef, {
            title: planTitle.value,
            timeline: doc(timelineRef, id),
            activeAbilities: plan.value.activeAbilities.map(obj => {
                let newData = { ...obj };
                // @ts-ignore: Create reference to document for db update
                newData.ability = doc(jobAbilityRef, obj.ability.title.toLowerCase().replace(/ /g, '_'))
                return newData;
            }),
            fflogsUrl: fflogsUrl.value,
            createdAt: serverTimestamp()
        }).then((newPlan) => {
            toast({ description: 'Plan saved' });
            planStore.clearPlan();
            myLatest.value.push({ title: planTitle.value, id: newPlan.id });
            navigateTo('/plan/' + newPlan.id)
        }).catch(() => {
            toast({ description: 'Saving failed', variant: 'destructive' });
        })
    },
    null,
    { immediate: false }
)

useSeoMeta({
    title: 'FFXIV mitigation planner'
})

useHead({
    link: [
        {
            rel: 'preload',
            as: 'image',
            href: '/bg.webp',
            fetchpriority: 'high'
        }
    ]
})
</script>

<style scoped>
.bg-ffimage {
    background-image: url(/bg.webp);
    background-size: cover;
    background-repeat: no-repeat;
    border-image: linear-gradient(hsl(0 0% 0% / .3), hsl(0 0% 0% / .5)) fill 1;
}
</style>