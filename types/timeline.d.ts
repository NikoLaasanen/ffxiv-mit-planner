interface Timeline {
    id?: string,
    title: string,
    contentType: ContentType,
    events: TimelineEvent[],
    tpl: boolean
}

type ContentType = 'unknown' | 'expert' | 'savage' | 'ultimate';

interface TimelineEvent {
    time: number,
    source: string,
    ability: BossAbility,
    visible: boolean
}

interface BossAbility {
    title: string,
    interruptable: boolean,
    damageType: DamageType,
    unmitigatedDamage: number[]
}

type DamageType = 'none' | 'magical' | 'physical';