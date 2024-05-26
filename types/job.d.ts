interface Job {
    abbr: JobAbbrevation,
    abilities: JobAbility[]
}

type TankAbbr = 'PLD' | 'WAR' | 'DRK' | 'GNB';
type HealerAbbr = 'WHM' | 'SCH' | 'AST' | 'SGE';
type MeleeDpsAbbr = 'DRG' | 'MNK' | 'NIN' | 'SAM' | 'RPR';
type CasterDpsAbbr = 'BLM' | 'SMN' | 'RDM';
type RangedDpsAbbr = 'BRD' | 'MCH' | 'DNC';
type DpsAbbr = MeleeDpsAbbr | CasterDpsAbbr | RangedDpsAbbr;

type JobAbbrevation = TankAbbr | HealerAbbr | DpsAbbr;

interface JobAbility {
    title: string,
    type: JobAbilityType,
    duration: number,
    cooldown: number
}

type JobAbilityType = 'mitigation' | 'interrupt' | 'buff' | 'debuff';