import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        showAutoAttacks: ref(true),
        activationBuffer: ref(0),
        showAbilityTypeMitigation: ref(true),
        showAbilityTypeUtility: ref(true),
        showAbilityTypeBuff: ref(false),
    }),
    persist: {
        storage: persistedState.localStorage
    },
    getters: {
        isAbilityVisible: (state) => {
            return (ability: JobAbility) =>
                (ability.type === 'mitigation' && state.showAbilityTypeMitigation) ||
                (ability.type === 'utility' && state.showAbilityTypeUtility) ||
                (ability.type === 'buff' && state.showAbilityTypeBuff)
        }
    },
})