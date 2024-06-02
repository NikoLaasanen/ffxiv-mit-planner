import { defineStore } from 'pinia'
import { isAbilityActivated } from '@/lib/utils'
import { useToast } from '@/components/ui/toast/use-toast'

export const usePlanStore = defineStore('plan', {
    state: () => ({
        plan: ref({
            title: "",
            timeline: {
                title: '',
                contentType: 'unknown',
                events: [] as TimelineEvent[]
            } as Timeline,
            activeAbilities: [] as ActiveAbility[],
            jobs: [] as JobAbbrevation[]
        } as Plan)
    }),
    getters: {
        isAbilityActivated: (state) => {
            return (playerAbility: ActiveAbility) => {
                return isAbilityActivated(playerAbility, state.plan.activeAbilities);
            };
        }
    },
    actions: {
        clearPlan() {
            this.plan = {
                title: "",
                timeline: {
                    title: '',
                    contentType: 'unknown',
                    events: [] as TimelineEvent[]
                } as Timeline,
                activeAbilities: [] as ActiveAbility[],
                jobs: [] as JobAbbrevation[]
            };
        },
        setTimeline(newTimeline: Timeline) {
            this.plan.timeline = newTimeline;
            this.plan.activeAbilities = [];
        },
        setTimelineEvents(events: TimelineEvent[]) {
            this.plan.timeline.events = events;
            this.plan.activeAbilities = [];
        },
        addTimelineEvent(event: TimelineEvent) {
            const { toast } = useToast()
            this.plan.timeline.events.push(event);
            this.plan.timeline.events.sort((a: TimelineEvent, b: TimelineEvent) => {
                if (a.time < b.time) return -1;
                else if (a.time > b.time) return 1;
                return 0;
            })
            toast({ description: 'Event added' });
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
        },
        toggleEventVisiblity(timelineEvent: TimelineEvent) {
            this.plan.timeline.events = this.plan.timeline.events.map(item => {
                if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
                    return { ...item, visible: !(item.visible ?? true) }
                }
                return item;
            });
        },
        setEventDamageType(timelineEvent: TimelineEvent, damageType: DamageType) {
            this.plan.timeline.events = this.plan.timeline.events.map(item => {
                if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
                    item.ability.damageType = damageType;
                    return item
                }
                return item;
            });
        }
    }
})