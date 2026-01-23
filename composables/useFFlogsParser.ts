import { fflogsJobMap, getRolePriority } from './useJobMapping';

export const useFFlogsParser = (
    actorMap: Ref<Map<number, fflogs_actor>>,
    abilityMap: Ref<Map<number, fflogs_ability>>,
    jobAbilities: Ref<JobAbility[]> | null
) => {
    const parseFFLogsUrl = (url: string): { reportId: string; fightId: number } => {
        const pattern = /fflogs\.com\/reports\/([^/?#]+).*?[?&]fight=(\d+)/;
        const match = url.match(pattern);

        if (!match) {
            return { reportId: '', fightId: 0 };
        }

        return {
            reportId: match[1],
            fightId: parseInt(match[2])
        };
    };

    const getTimeInSeconds = (timestamp: number): number => {
        return timestamp >= 0 ? Math.round(timestamp / 1000) : -1;
    };

    const getFirstEventTimestamp = (events: fflogs_event[]): number => {
        for (const event of events) {
            const actor = actorMap.value.get(event.sourceID);
            if (event.type === 'damage' && actor && actor.type === 'NPC' && actor.name !== 'Environment') {
                return event.timestamp;
            }
        }
        return 0;
    };

    const parseTimelineData = (events: fflogs_event[], firstEventTimestamp: number): TimelineEvent[] => {
        const timeline = [] as TimelineEvent[];
        for (const event of events) {
            const actor = actorMap.value.get(event.sourceID);
            if (event.type === 'damage' && actor && actor.type === 'NPC' && actor.name !== 'Environment') {
                const time = getTimeInSeconds(event.timestamp - firstEventTimestamp);
                const abilityName = abilityMap.value.get(event.abilityGameID)?.name ?? 'Unknown';

                // Skip dots and mechanic punishment events
                if (abilityName === 'Combined DoTs' || abilityName === 'Unmitigated Explosion') continue;

                const damage = event.unmitigatedAmount ?? event.amount ?? 0;

                const last = timeline[timeline.length - 1];

                // Check if we should merge with the previous entry
                const shouldMerge = last && last.source === actor.name && last.ability.title === abilityName && Math.abs(last.time - time) < 1; // 1s window
                if (shouldMerge) {
                    last.sourceCount += 1;
                    if (damage > 0) {
                        last.ability.unmitigatedDamage.push(damage);
                    }
                } else {
                    timeline.push({
                        time: time,
                        source: actor.name,
                        sourceCount: 1,
                        ability: {
                            title: abilityName,
                            damageType: 'magical',
                            unmitigatedDamage: damage > 0 ? [event.unmitigatedAmount ?? event.amount] : []
                        } as BossAbility
                    } as TimelineEvent);
                }
            }
        }
        return timeline;
    };

    const getJobAbilityByName = (name: string): JobAbility | null => {
        if (!jobAbilities?.value) return null;

        for (const ability of jobAbilities.value) {
            if (ability.title === name) {
                return ability;
            }
        }
        return null;
    };

    const parseActiveAbilityData = (events: fflogs_event[], firstEventTimestamp: number): ActiveAbility[] => {
        const activeAbilities: ActiveAbility[] = [];

        for (const event of events) {
            const actor = actorMap.value.get(event.sourceID);
            // Only track player buff applications
            if (event.type === 'cast' && actor && actor.type === 'Player' && actor.subType !== 'Unknown') {
                const abilityName = (abilityMap.value.get(event.abilityGameID)?.name ?? 'Unknown') as string;
                const jobAbbr = fflogsJobMap[actor.subType as string];
                const jobAbility = getJobAbilityByName(abilityName);
                if (jobAbbr && jobAbility) {
                    activeAbilities.push({
                        source: jobAbbr,
                        ability: jobAbility,
                        time: getTimeInSeconds(event.timestamp - firstEventTimestamp)
                    } as ActiveAbility);
                }
            }
        }

        return activeAbilities;
    };

    const parseDebuffData = (events: fflogs_event[], firstEventTimestamp: number): PlayerMistake[] => {
        const mistakes: PlayerMistake[] = [];
        const pendingMistakes: { mistake: PlayerMistake; sourceInstance: number }[] = [];

        // Process debuff events
        for (const event of events) {
            const actor = actorMap.value.get(event.targetID);
            if (!actor || actor.type !== 'Player' || actor.subType === 'Unknown') continue;

            const abilityName = (abilityMap.value.get(event.abilityGameID)?.name ?? 'Unknown') as string;
            const jobAbbr = fflogsJobMap[actor.subType as string];

            if (!jobAbbr || !isTrackedDebuff(abilityName)) continue;

            if (event.type === 'applydebuff') {
                pendingMistakes.push({
                    mistake: {
                        type: abilityName as MistakeType,
                        source: jobAbbr,
                        timestamp: event.timestamp,
                        duration: 0
                    },
                    sourceInstance: event.sourceInstance ?? 0
                });
            } else if (event.type === 'removedebuff') {
                handleDebuffRemoval(pendingMistakes, mistakes, abilityName, jobAbbr, event, firstEventTimestamp);
            }
        }

        // Add remaining mistakes (still active at fight end)
        finalizePendingMistakes(pendingMistakes, mistakes, firstEventTimestamp);

        return mistakes;
    };

    const isTrackedDebuff = (abilityName: string): boolean => {
        return abilityName === 'Weakness' || abilityName === 'Brink of Death' || abilityName === 'Damage Down';
    };

    const handleDebuffRemoval = (
        pendingMistakes: { mistake: PlayerMistake; sourceInstance: number }[],
        mistakes: PlayerMistake[],
        abilityName: string,
        jobAbbr: JobAbbrevation,
        event: fflogs_event,
        firstEventTimestamp: number
    ): void => {
        const index = pendingMistakes.findIndex(
            m =>
                m.sourceInstance === (event.sourceInstance ?? 0) &&
                m.mistake.type === abilityName &&
                m.mistake.source === jobAbbr
        );

        if (index !== -1) {
            const appliedMistake = pendingMistakes[index];
            appliedMistake.mistake.duration = getTimeInSeconds(event.timestamp - appliedMistake.mistake.timestamp);
            appliedMistake.mistake.timestamp = getTimeInSeconds(appliedMistake.mistake.timestamp - firstEventTimestamp);
            mistakes.push(appliedMistake.mistake);
            pendingMistakes.splice(index, 1);
        }
    };

    const finalizePendingMistakes = (
        pendingMistakes: { mistake: PlayerMistake; sourceInstance: number }[],
        mistakes: PlayerMistake[],
        firstEventTimestamp: number
    ): void => {
        pendingMistakes.forEach(m => {
            m.mistake.duration = getDefaultDebuffDuration(m.mistake.type);
            m.mistake.timestamp = getTimeInSeconds(m.mistake.timestamp - firstEventTimestamp);
            mistakes.push(m.mistake);
        });
    };

    const getDefaultDebuffDuration = (debuffType: MistakeType): number => {
        if (debuffType === 'Weakness' || debuffType === 'Brink of Death') {
            return 100; // 100 seconds for death debuffs
        }
        return 600; // 10 minutes as a fallback
    };

    const parseActiveJobs = (activeAbilities: ActiveAbility[]): JobAbbrevation[] => {
        const jobs: JobAbbrevation[] = [];

        // Get unique activeAbilities.source entries        
        activeAbilities.forEach(ability => {
            if (!jobs.includes(ability.source)) {
                jobs.push(ability.source);
            }
        });

        // Sort jobs so we get healers > tanks > dps > misc
        jobs.sort((a, b) => getRolePriority(a) - getRolePriority(b));

        return jobs;
    };

    return {
        parseFFLogsUrl,
        getFirstEventTimestamp,
        parseTimelineData,
        parseActiveAbilityData,
        parseDebuffData,
        parseActiveJobs,
        getTimeInSeconds
    };
};
