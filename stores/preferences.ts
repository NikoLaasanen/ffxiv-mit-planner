import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        showAutoAttacks: ref(true),
        activationBuffer: ref(0)
    }),
    persist: {
        storage: persistedState.localStorage
    }
})