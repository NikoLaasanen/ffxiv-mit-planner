interface TimelineTemplate {
    contentType: ContentType,
    timeline: Timeline
}

interface Timeline {
    id?: string,
    title: string,
    events: TimelineEvent[]
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