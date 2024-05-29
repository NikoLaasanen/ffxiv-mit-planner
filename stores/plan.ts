import { defineStore } from 'pinia'
import { isAbilityActivated } from '@/lib/utils'

export const usePlanStore = defineStore('plan', {
    state: () => ({
        plan: ref({
            title: "",
            timeline: {} as Timeline,
            activeAbilities: [] as ActiveAbility[],
            jobs: [] as JobAbbrevation[]
        } as Plan),
        activationBuffer: ref(2)
    }),
    getters: {
        isAbilityActivated: (state) => {
            return (playerAbility: ActiveAbility) => {
                return isAbilityActivated(playerAbility, state.plan.activeAbilities);
            };
        }
    },
    actions: {
        setTimeline(newTimeline: Timeline) {
            this.plan.timeline = newTimeline;
            this.plan.activeAbilities = [];
        },
        setTimelineEvents(events: TimelineEvent[]) {
            this.plan.timeline.events = events;
            this.plan.activeAbilities = [];
        },
        addTimelineEvent(event: TimelineEvent) {
            this.plan.timeline.events.push(event);
            this.plan.timeline.events.sort((a: TimelineEvent, b: TimelineEvent) => {
                if (a.time < b.time) return -1;
                else if (a.time > b.time) return 1;
                return 0;
            })
        },
        setActiveAbilities(activations: ActiveAbility[]) {
            this.plan.activeAbilities = activations;
        },
        toggleActiveAbility(activation: ActiveAbility) {
            if (!this.isAbilityActivated(activation)) {
                this.plan.activeAbilities.push(activation);
            } else {
                this.plan.activeAbilities = this.plan.activeAbilities.filter(item => JSON.stringify(item) !== JSON.stringify(activation))
            }
        }
    }
})