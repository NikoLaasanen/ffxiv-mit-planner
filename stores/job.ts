import { defineStore } from 'pinia'
import { collection } from 'firebase/firestore'

export const useJobStore = defineStore('job', {
    state: () => ({
        jobs: ref()
    }),
    actions: {
        async loadJobs() {
            const db = useFirestore();
            const jobRef = collection(db, 'job');
            this.jobs = useCollection<Job>(jobRef);
        }
    }
})