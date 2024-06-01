export const useJobAbilityVisible = (ability: JobAbility) => {
    const preferencesStore = usePreferencesStore();
    const {
        showAbilityTypeMitigation,
        showAbilityTypeUtility,
        showAbilityTypeBuff
    } = storeToRefs(preferencesStore);

    return (ability.type === 'mitigation' && showAbilityTypeMitigation.value) ||
        (ability.type === 'utility' && showAbilityTypeUtility.value) ||
        (ability.type === 'buff' && showAbilityTypeBuff.value)
}