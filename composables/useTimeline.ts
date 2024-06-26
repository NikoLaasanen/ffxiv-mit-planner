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

  function getDamageType(timeline: Timeline, eventTitle: string) {
    return timeline.events.find(item => item.ability.title === eventTitle)?.ability.damageType
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

  function addDamageValue(timeline: Timeline, timelineEvent: TimelineEvent, newValue: number) {
    timeline.events = timeline.events.map(item => {
      if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
        item.ability.unmitigatedDamage.push(newValue);
        return item
      }
      return item;
    });
  }

  function removeDamageValue(timeline: Timeline, timelineEvent: TimelineEvent, removedKey: number) {
    timeline.events = timeline.events.map(item => {
      if (item.time === timelineEvent.time && item.ability.title === timelineEvent.ability.title) {
        item.ability.unmitigatedDamage.splice(removedKey, 1);
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

  function getOffset(eventsA: TimelineEvent[], eventsB: TimelineEvent[]) {
    let offset = 0;
    for (let i = 0; i < eventsA.length && offset < 0; i++) {
      if (eventsA[i].ability.title !== 'attack') {
        for (const row of eventsB) {
          if (row.ability.title === eventsA[i].ability.title) {
            console.log(row.ability.title, row.time, eventsA[i].time)
            offset = row.time - eventsA[i].time;
            break;
          }
        }
      }
    }
    return offset;
  }

  return { addEvent, hasEvent, getDamageType, setDamageType, addDamageValue, removeDamageValue, setVisibility, getOffset }
}