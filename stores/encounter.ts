import { defineStore } from 'pinia'

export const useEncounterStore = defineStore('encounter', {
    state: () => ({
        timeline: ref([] as TimelineEvent[]),
        jobs: ref([] as Job[]),
        activeAbilities: ref([] as ActivePlayerAbility[]),
        activationBuffer: ref(1)
    }),
    getters: {
        isAbilityTriggered: (state) => {
            return (playerAbility: ActivePlayerAbility) => state.activeAbilities.some(
                item => item.activation === playerAbility.activation &&
                    item.owner === playerAbility.owner &&
                    item.ability.title === playerAbility.ability.title
            );
        },
        isAbilityActive: (state) => {
            return (playerAbility: ActivePlayerAbility) => state.activeAbilities.some(
                item => {
                    if (item.owner === playerAbility.owner && item.ability.title === playerAbility.ability.title) {
                        return playerAbility.activation > item.activation &&
                            playerAbility.activation < item.activation + item.ability.duration - state.activationBuffer
                    } else {
                        return false;
                    }
                }
            );
        },
        isAbilityOnCooldown: (state) => {
            return (playerAbility: ActivePlayerAbility) => state.activeAbilities.some(
                item => {
                    if (item.owner === playerAbility.owner && item.ability.title === playerAbility.ability.title) {
                        return (playerAbility.activation > item.activation &&
                            playerAbility.activation < item.activation + item.ability.cooldown) ||
                            (playerAbility.activation < item.activation &&
                                playerAbility.activation > item.activation - item.ability.cooldown)
                    } else {
                        return false;
                    }
                }
            );
        },
    },
    actions: {
        setTimeline(newTimeline: TimelineEvent[]) {
            this.timeline = newTimeline;
        },
        addTimelineEvent(event: TimelineEvent) {
            this.timeline.push(event)
            this.timeline.sort((a: TimelineEvent, b: TimelineEvent) => {
                if (a.time < b.time) return -1;
                else if (a.time > b.time) return 1;
                return 0;
            })
        },
        togglePlayerAbility(activation: ActivePlayerAbility) {
            if (!this.isAbilityTriggered(activation)) {
                this.activeAbilities.push(activation);
            } else {
                this.activeAbilities = this.activeAbilities.filter(item => JSON.stringify(item) !== JSON.stringify(activation))
            }
        },
        async toggleJob(abbr: JobAbbrevation) {
            if (!this.jobs.some(job => job.abbr === abbr)) {
                const response = await fetch(`/data/jobs/${abbr.toLowerCase()}.json`);
                if (!response.ok) {
                    // error
                }
                this.jobs.push(await response.json() as Job);
            } else {
                this.jobs = this.jobs.filter(job => job.abbr !== abbr)
            }
        }
    }
})