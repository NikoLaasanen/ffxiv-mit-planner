<template>
    <LoadingIcon v-if="pending" />
    <div v-else-if="plan" class="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardDescription>
                    {{ plan.timeline.title }}
                </CardDescription>
                <CardTitle>
                    <div class="flex gap-2">
                        <PlanTitleEditor :title="plan.title"
                            @update:title="newTitle => updateTitle(undefined, newTitle)" class="grow" />
                        <PlanFavorite :plan-id="plan.id" :plan-title="plan.title" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Plan v-if="isAllDoneFetching" :timeline="plan.timeline" :active-abilities="plan.activeAbilities"
                    @change:active-ability="toggleAbility"
                    @change:rowVisibility="timelineEvent => toggleEventVisiblity(timelineEvent)"
                    @change:damageType="(timelineEvent, newType) => setTimelineEventDamageType(timelineEvent, newType)" />
                <PlanSkeleton v-else />

                <div v-if="showMedianDamage" class="mt-4">
                    <Label>Set damage threshold</Label>
                    <Input v-model="damageThreshold" type="number" class="max-w-prose" />
                    <p class="text-muted-foreground text-sm">Damage taken values higher than threshold are considered
                        dangerous and
                        will be highlighed in the timeline.</p>
                </div>
            </CardContent>
        </Card>

        <Button @click="updateActiveAbilities" :disabled="!isAllDoneFetching">Save</Button>

        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Edit timeline</CardTitle>
                    <CardDescription>Add a new single event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex flex-col gap-4">
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
                        <TimelineEditorFflog default-adding-method="merge" @new-timeline="addMultipleTimelineEvents" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
    <div v-else>
        <Alert variant="destructive">
            <AlertTitle class="flex items-center gap-2">
                <Icon icon="radix-icons:exclamation-triangle" /> Not found!
            </AlertTitle>
            <AlertDescription>
                <p class="mb-2">This plan does not exist anymore.</p>
                <Button as-child>
                    <NuxtLink :to="'/'">Back to frontpage</NuxtLink>
                </Button>
            </AlertDescription>
        </Alert>
    </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { useAsyncState } from '@vueuse/core'
import { useToast } from '@/components/ui/toast/use-toast'
import { collection, doc, updateDoc } from 'firebase/firestore'
import { usePendingPromises } from 'vuefire'
import { JobKey } from '~/injectionkeys'
import { isAbilityActivated } from '@/lib/utils'

const preferencesStore = usePreferencesStore();
const { showMedianDamage } = storeToRefs(preferencesStore);

const { toast } = useToast()
const { addEvent, hasEvent, getDamageType, setDamageType, setVisibility, getOffset } = useTimeline();

const damageThreshold = ref(0);
provide('damage-threshold', damageThreshold);

const route = useRoute();
const db = useFirestore();

const jobRef = collection(db, 'job');
const jobs = useCollection<Job>(jobRef);
provide(JobKey, jobs);

const planRef = collection(db, 'plan');
const timelineRef = collection(db, 'timeline');
const jobAbilityRef = collection(db, 'jobability');
const planSource = computed(() =>
    doc(planRef, String(route.params.id))
)

const { data: plan, pending } = useDocument<Plan>(planSource);

const toggleAbility = (activation: ActiveAbility) => {
    if (plan.value) {
        if (!isAbilityActivated(activation, plan.value?.activeAbilities)) {
            plan.value.activeAbilities.push(activation);
        } else {
            plan.value.activeAbilities = plan.value.activeAbilities.filter(item =>
                item.source !== activation.source ||
                item.time !== activation.time ||
                JSON.stringify(item.ability) !== JSON.stringify(activation.ability)
            )
        }
    }
}

const toggleEventVisiblity = (timelineEvent: TimelineEvent) => {
    if (plan.value) {
        setVisibility(plan.value.timeline, timelineEvent);
    }
}

const setTimelineEventDamageType = (timelineEvent: TimelineEvent, damageType: DamageType) => {
    if (plan.value) {
        setDamageType(plan.value.timeline, timelineEvent, damageType);
    }
}

const addNewTimelineEvent = (newEvent: TimelineEvent) => {
    if (plan.value) {
        addEvent(plan.value.timeline, newEvent)
    }
}

const addMultipleTimelineEvents = (newEvents: TimelineEvent[], addingMethod: string, autoAdjust: boolean, replaceStart: number) => {
    if (plan.value) {
        if (addingMethod === 'merge') {
            let offset = autoAdjust ? getOffset(newEvents, plan.value.timeline.events) : 0;
            newEvents.forEach(item => {
                item.time += offset;
                console.log(item)
                if (plan.value && !hasEvent(plan.value.timeline, item)) {
                    const dmgType = getDamageType(plan.value.timeline, item.ability.title)
                    if (dmgType) {
                        item.ability.damageType = dmgType;
                    }
                    plan.value.timeline.events.push(item);
                    plan.value.timeline.events.sort((a, b) => a.time - b.time);
                }
            })
        } else if (addingMethod === 'replace') {
            plan.value.timeline.events = plan.value.timeline.events.filter(item => item.time < replaceStart)
            newEvents.forEach(item => {
                if (plan.value) {
                    const dmgType = getDamageType(plan.value.timeline, item.ability.title)
                    if (dmgType) {
                        item.ability.damageType = dmgType;
                    }
                    plan.value.timeline.events.push(item)
                }
            })
        }
    }
}

const {
    execute: updateTitle,
    isLoading: isUpdatingTitle
} = useAsyncState(
    (newTitle: string) => {
        return updateDoc(planSource.value, {
            title: newTitle
        }).then(() => {
            toast({ description: 'Title updated' });
        }).catch(() => {
            toast({ description: 'Update failed', variant: 'destructive' });
        })
    },
    null,
    { immediate: false }
)

const {
    execute: updateActiveAbilities,
    isLoading: isUpdatingActiveAbilities
} = useAsyncState(
    async () => {
        if (!plan.value) {
            return Promise.reject(new Error('Saving prevented'))
        }

        // Fetch refs for abilities
        const updatedData = plan.value?.activeAbilities.map(obj => {
            let newData = { ...obj };
            // @ts-ignore: Create reference to document for db update
            newData.ability = doc(jobAbilityRef, obj.ability.title.toLowerCase().replace(' ', '_'))
            return newData;
        })

        // Update timeline
        const timelineItemRef = doc(timelineRef, plan.value.timeline.id);
        await updateDoc(timelineItemRef, { events: plan.value.timeline.events });

        return updateDoc(planSource.value, {
            activeAbilities: updatedData
        }).then(() => {
            toast({ description: 'Plan updated' });
        }).catch(() => {
            toast({ description: 'Update failed', variant: 'destructive' });
        })
    },
    null,
    { immediate: false }
)

const isAllDoneFetching = ref(false);
onMounted(() => {
    usePendingPromises().then(() => {
        isAllDoneFetching.value = true
    })
})

useSeoMeta({
    title: () => `${plan.value?.title ?? ''} - FFXIV mitigation planner`
})
</script>