interface TimelineEvent {
    time: number,
    source: string,
    ability: BossAbility
}

interface BossAbility {
    title: string,
    damageType: DamageType
}

interface ActivePlayerAbility {
    activation: number,
    owner: JobAbbrevation,
    ability: JobAbility
}

type DamageType = 'none' | 'magical' | 'physical';