import { CastEvent, FreeCastEvent } from 'parser/core/Events';

export interface HighPriorityRule {
  spellId: number | number[];
  condition: (e: CastEvent | FreeCastEvent) => boolean;
  enhancedCastReason?: (isValidCast: boolean) => React.ReactNode | string | null | undefined;
}

export type HighPriorityAbilities = (number | HighPriorityRule)[];

export function isHighPriorityAbility(
  event: CastEvent,
  highPriorityAbilities: HighPriorityAbilities,
) {
  return (getApplicableRules(event, highPriorityAbilities)?.length ?? 0) > 0;
}

export function getApplicableRules(
  event: CastEvent,
  highPriorityAbilities: HighPriorityAbilities,
): (HighPriorityRule | number)[] | undefined {
  return highPriorityAbilities.filter((value) => {
    if (typeof value === 'number') {
      return event.ability.guid === value;
    }
    if (
      (Array.isArray(value.spellId) && value.spellId.includes(event.ability.guid)) ||
      event.ability.guid === value.spellId
    ) {
      return value.condition(event);
    }
    return false;
  });
}
