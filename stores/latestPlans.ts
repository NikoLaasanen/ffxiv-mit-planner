import { defineStore } from 'pinia'

export const useLatestPlansStore = defineStore('latest-plans', {
    state: () => ({
        latest: ref([] as { title: string, id: string }[])
    }),
    persist: {
        storage: persistedState.localStorage
    },
    actions: {
    }
})