interface Plan {
    title: string,
    timeline: Timeline,
    activeAbilities: ActiveAbility[],
    jobs: JobAbbrevation[]
}

interface ActiveAbility {
    time: number,
    source: JobAbbrevation,
    ability: JobAbility
}