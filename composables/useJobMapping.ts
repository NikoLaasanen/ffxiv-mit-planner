export const fflogsJobMap: Record<string, JobAbbrevation> = {
    'Paladin': 'PLD' as TankAbbr,
    'Warrior': 'WAR' as TankAbbr,
    'DarkKnight': 'DRK' as TankAbbr,
    'Gunbreaker': 'GNB' as TankAbbr,
    'WhiteMage': 'WHM' as HealerAbbr,
    'Scholar': 'SCH' as HealerAbbr,
    'Astrologian': 'AST' as HealerAbbr,
    'Sage': 'SGE' as HealerAbbr,
    'Monk': 'MNK' as MeleeDpsAbbr,
    'Dragoon': 'DRG' as MeleeDpsAbbr,
    'Ninja': 'NIN' as MeleeDpsAbbr,
    'Samurai': 'SAM' as MeleeDpsAbbr,
    'Reaper': 'RPR' as MeleeDpsAbbr,
    'Viper': 'VPR' as MeleeDpsAbbr,
    'BlackMage': 'BLM' as CasterDpsAbbr,
    'Summoner': 'SMN' as CasterDpsAbbr,
    'RedMage': 'RDM' as CasterDpsAbbr,
    'Pictomancer': 'PCT' as CasterDpsAbbr,
    'Bard': 'BRD' as RangedDpsAbbr,
    'Machinist': 'MCH' as RangedDpsAbbr,
    'Dancer': 'DNC' as RangedDpsAbbr,
};

export const isHealer = (job: JobAbbrevation): job is HealerAbbr =>
    ['WHM', 'SCH', 'AST', 'SGE'].includes(job as HealerAbbr);

export const isTank = (job: JobAbbrevation): job is TankAbbr =>
    ['PLD', 'WAR', 'DRK', 'GNB'].includes(job as TankAbbr);

export const isDps = (job: JobAbbrevation): job is DpsAbbr =>
    ['DRG', 'MNK', 'NIN', 'SAM', 'RPR', 'VPR', 'BLM', 'SMN', 'RDM', 'PCT', 'BRD', 'MCH', 'DNC'].includes(job as DpsAbbr);

export const getRolePriority = (job: JobAbbrevation): number => {
    if (isHealer(job)) return 0;
    if (isTank(job)) return 1;
    if (isDps(job)) return 2;
    return 3; // MiscOptionsAbbr
};
