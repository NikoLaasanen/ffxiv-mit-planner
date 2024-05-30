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
    ability: BossAbility
}

interface BossAbility {
    title: string,
    damageType: DamageType
}

type DamageType = 'none' | 'magical' | 'physical';