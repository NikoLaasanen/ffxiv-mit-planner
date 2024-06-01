import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        showAutoAttacks: ref(true),
        activationBuffer: ref(0),
        showAbilityTypeMitigation: ref(true),
        showAbilityTypeUtility: ref(true),
        showAbilityTypeBuff: ref(false),
        jobAbilityHidden: ref([] as string[])
    }),
    persist: {
        storage: persistedState.localStorage
    },
    getters: {
        isAbilityVisible: (state) => {
            return (ability: JobAbility) =>
                ((ability.type === 'mitigation' && state.showAbilityTypeMitigation) ||
                    (ability.type === 'utility' && state.showAbilityTypeUtility) ||
                    (ability.type === 'buff' && state.showAbilityTypeBuff)) &&
                !state.jobAbilityHidden.includes(ability.title)
        },
        isAbilityInHiddens: (state) => {
            return (ability: JobAbility) => state.jobAbilityHidden.includes(ability.title)
        }
    },
    actions: {
        toggleJobAbilityVisibility(ability: JobAbility) {
            if (!this.jobAbilityHidden.includes(ability.title)) {
                this.jobAbilityHidden.push(ability.title);
            } else {
                this.jobAbilityHidden = this.jobAbilityHidden.filter(item => item !== ability.title)
            }
        },
        setJobAbilityVisibility(ability: JobAbility, show: boolean) {
            if (show) {
                this.jobAbilityHidden = this.jobAbilityHidden.filter(item => item !== ability.title)
            }
            else if (!show && !this.jobAbilityHidden.includes(ability.title)) {
                this.jobAbilityHidden.push(ability.title);
            }
        },
        clearJobAbilityVisibilites() {
            this.jobAbilityHidden = [];
        }
    }
})