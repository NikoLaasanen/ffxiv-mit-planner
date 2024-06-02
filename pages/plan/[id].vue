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
                    @change:damageType="(timelineEvent, newType) => setEventDamageType(timelineEvent, newType)" />
                <PlanSkeleton v-else />
            </CardContent>
        </Card>

        <Button @click="updateActiveAbilities" :disabled="!isAllDoneFetching">Save</Button>
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

const { toast } = useToast()

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
    if (plan.value && plan.value.activeAbilities.length > 0) {
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
        plan.value.timeline.events = plan.value.timeline.events.map(item => {
            if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
                return { ...item, visible: !(item.visible ?? true) }
            }
            return item;
        });
    }
}

const setEventDamageType = (timelineEvent: TimelineEvent, damageType: DamageType) => {
    if (plan.value) {
        plan.value.timeline.events = plan.value.timeline.events.map(item => {
            if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
                item.ability.damageType = damageType;
                return item
            }
            return item;
        });
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