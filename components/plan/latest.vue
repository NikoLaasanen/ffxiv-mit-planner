<template>
    <div v-if="pending">
        <LoadingIcon />
    </div>
    <ul v-else-if="latestPlans.length > 0" class="flex flex-wrap place-content-center gap-2">
        <li v-for="plan in latestPlans" :key="plan.id">
            <Button as-child>
                <NuxtLink :to="'/plan/' + plan.id">{{ plan.title }}</NuxtLink>
            </Button>
        </li>
    </ul>
    <p v-else>
        No plans created yet.
    </p>
</template>

<script lang="ts" setup>
import { collection, limit, orderBy, query, type Timestamp } from 'firebase/firestore';

const db = useFirestore();
const planRef = collection(db, 'plan');

const { data: latestPlans, pending } = useCollection<Plan>(
    query(
        planRef,
        orderBy('createdAt', 'desc'),
        limit(5)
    ),
    { ssrKey: 'latest-plans' }
)
</script>