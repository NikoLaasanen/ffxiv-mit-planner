interface Job {
    title: string,
    abbr: JobAbbrevation,
    role: JobRole,
    subrole?: JosSubRole,
    icon?: string,
    abilities: JobAbility[],
}

type TankAbbr = 'PLD' | 'WAR' | 'DRK' | 'GNB';
type HealerAbbr = 'WHM' | 'SCH' | 'AST' | 'SGE';
type MeleeDpsAbbr = 'DRG' | 'MNK' | 'NIN' | 'SAM' | 'RPR' | 'VPR';
type CasterDpsAbbr = 'BLM' | 'SMN' | 'RDM' | 'PCT';
type RangedDpsAbbr = 'BRD' | 'MCH' | 'DNC';
type DpsAbbr = MeleeDpsAbbr | CasterDpsAbbr | RangedDpsAbbr;
type MiscOptionsAbbr = 'LB';

type JobAbbrevation = TankAbbr | HealerAbbr | DpsAbbr | MiscOptionsAbbr;

type JobRole = 'tank' | 'healer' | 'dps';
type JosSubRole = 'regen' | 'shield' | 'melee' | 'caster' | 'ranged';

interface JobAbility {
    title: string,
    type: JobAbilityType,
    duration: number,
    cooldown: number,
    singletarget?: boolean,
    icon?: string,
    potency?: JobAbilityPotency
}

type JobAbilityType = 'mitigation' | 'utility' | 'interrupt' | 'buff' | 'debuff';

interface JobAbilityPotency {
    [K in DamageType]?: number;
}