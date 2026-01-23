import { defineStore } from 'pinia'
import { isAbilityActivated } from '@/lib/utils'
import { useToast } from '@/components/ui/toast/use-toast'

export const usePlanStore = defineStore('plan', {
    state: () => ({
        plan: ref({
            title: "",
            timeline: {
                title: '',
                events: [] as TimelineEvent[]
            } as Timeline,
            activeAbilities: [] as ActiveAbility[],
            jobs: [] as JobAbbrevation[]
        } as Plan),
        mistakes: ref([] as PlayerMistake[]),
        isPlanLoading: ref(false)
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
                    events: [] as TimelineEvent[]
                } as Timeline,
                activeAbilities: [] as ActiveAbility[],
                jobs: [] as JobAbbrevation[]
            };
            this.mistakes = [];
        },
        setTimeline(newTimeline: Timeline) {
            this.plan.timeline = newTimeline;
            this.plan.activeAbilities = [];
            this.mistakes = [];
        },
        setTimelineEvents(events: TimelineEvent[]) {
            this.plan.timeline.events = events;
            this.plan.activeAbilities = [];
            this.mistakes = [];
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
        setJobs(jobs: JobAbbrevation[]) {
            this.plan.jobs = jobs;
        },
        setActiveAbilities(activations: ActiveAbility[]) {
            this.plan.activeAbilities = activations;
            this._normalizeAbilityTimes();
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
                if (item.ability.title === timelineEvent.ability.title) {
                    item.ability.damageType = damageType;
                    return item
                }
                return item;
            });
        },
        addTimelineEventDamageValue(timelineEvent: TimelineEvent, newDamageValue: number) {
            const { addDamageValue } = useTimeline();
            addDamageValue(this.plan.timeline, timelineEvent, newDamageValue);
        },
        removeTimelineEventDamageValue(timelineEvent: TimelineEvent, removedKey: number) {
            const { removeDamageValue } = useTimeline();
            removeDamageValue(this.plan.timeline, timelineEvent, removedKey);
        },
        setMistakes(mistakes: PlayerMistake[]) {
            this.mistakes = mistakes;
        },
        _normalizeAbilityTimes() {
            const THRESHOLD_MS = 2000; // 2 seconds
            this.plan.activeAbilities.forEach(activation => {
                const nonAttackEvents = this.plan.timeline.events.filter(event => event.ability.title !== 'Attack');
                const closestEvent = nonAttackEvents.reduce((prev, curr) => {
                    return (Math.abs(curr.time - activation.time) < Math.abs(prev.time - activation.time) ? curr : prev);
                });
                const distance = Math.abs(closestEvent.time - activation.time);
                if (distance <= THRESHOLD_MS) {
                    activation.time = closestEvent.time;
                }
            });
        }
    }
})