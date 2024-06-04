import { useToast } from '@/components/ui/toast/use-toast'

export default () => {
  function addEvent(timeline: Timeline, newEvent: TimelineEvent) {
    const { toast } = useToast()
    timeline.events.push(newEvent);
    timeline.events.sort((a: TimelineEvent, b: TimelineEvent) => {
      if (a.time < b.time) return -1;
      else if (a.time > b.time) return 1;
      return 0;
    })
    toast({ description: 'Event added' });
  }

  function hasEvent(timeline: Timeline, event: TimelineEvent) {
    return timeline.events.some(item => item.time === event.time && item.ability.title === event.ability.title)
  }

  function setDamageType(timeline: Timeline, timelineEvent: TimelineEvent, damageType: DamageType) {
    timeline.events = timeline.events.map(item => {
      if (item.ability.title === timelineEvent.ability.title) {
        item.ability.damageType = damageType;
        return item
      }
      return item;
    });
  }

  function setVisibility(timeline: Timeline, timelineEvent: TimelineEvent) {
    timeline.events = timeline.events.map(item => {
      if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
        return { ...item, visible: !(item.visible ?? true) }
      }
      return item;
    });
  }

  return { addEvent, hasEvent, setDamageType, setVisibility }
}