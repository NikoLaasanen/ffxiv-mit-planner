<template>
    <LoadingIcon v-if="pending" />
    <div v-else-if="plan" class="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardDescription>
                    {{ plan.timeline.title }}
                </CardDescription>
                <CardTitle>
                    <PlanTitleEditor :title="plan.title" @update:title="newTitle => updateTitle(undefined, newTitle)" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Plan :timeline="plan.timeline" :active-abilities="plan.activeAbilities"
                    @change:active-ability="toggleAbility" />
            </CardContent>
        </Card>

        <Button @click="updateActiveAbilities">Save</Button>
    </div>
</template>

<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import { useToast } from '@/components/ui/toast/use-toast'
import { collection, doc, updateDoc } from 'firebase/firestore'
import { JobKey } from '~/injectionkeys'
import { isAbilityActivated } from '@/lib/utils'

const { toast } = useToast()

const route = useRoute();
const db = useFirestore();

const jobRef = collection(db, 'job');
const jobs = useCollection<Job>(jobRef);
provide(JobKey, jobs);

const planRef = collection(db, 'plan');
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

const {
    execute: updateTitle,
    isLoading: isUpdatingTitleAbilities
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
    () => {
        const updatedData = plan.value?.activeAbilities.map(obj => {
            let newData = { ...obj };
            // @ts-ignore: Create reference to document for db update
            newData.ability = doc(jobAbilityRef, obj.ability.title.toLowerCase())
            return newData;
        })
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
</script>