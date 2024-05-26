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
type MeleeDpsAbbr = 'DRG' | 'MNK' | 'NIN' | 'SAM' | 'RPR';
type CasterDpsAbbr = 'BLM' | 'SMN' | 'RDM';
type RangedDpsAbbr = 'BRD' | 'MCH' | 'DNC';
type DpsAbbr = MeleeDpsAbbr | CasterDpsAbbr | RangedDpsAbbr;

type JobAbbrevation = TankAbbr | HealerAbbr | DpsAbbr;

type JobRole = 'tank' | 'healer' | 'dps';
type JosSubRole = 'regen' | 'shield' | 'melee' | 'caster' | 'ranged';

interface JobAbility {
    title: string,
    type: JobAbilityType,
    duration: number,
    cooldown: number,
    icon?: string
}

type JobAbilityType = 'mitigation' | 'interrupt' | 'buff' | 'debuff';