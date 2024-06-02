import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAbilityActivated(targetAbility: ActiveAbility, activeAbilities: ActiveAbility[]) {
  return activeAbilities.some(
    item => item.time === targetAbility.time &&
      item.source === targetAbility.source &&
      item.ability.title === targetAbility.ability.title
  );
}

export function isAbilityInterrupted(timelineEvent: TimelineEvent, activeAbilities: ActiveAbility[]) {
  if (!(timelineEvent.ability?.interruptable ?? false)) return false;

  return activeAbilities.some(item =>
    item.time === timelineEvent.time && item.ability.type === 'interrupt'
  );
}