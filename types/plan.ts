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

type MistakeType = 'Death' | 'Weakness' | 'Brink of Death' | 'Damage Down';

interface PlayerMistake {
    type: MistakeType,
    source: JobAbbrevation,
    timestamp: number,
    duration: number
}