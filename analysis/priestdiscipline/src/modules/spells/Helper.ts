import { DamageEvent, HealEvent } from 'parser/core/Events';

export function IsPenanceDamageEvent(event: DamageEvent): event is PenanceDamageEvent {
  return (event as PenanceDamageEvent).penanceBoltNumber !== undefined;
}

export interface PenanceDamageEvent extends DamageEvent {
  penanceBoltNumber: number;
}

export function IsPenanceHealEvent(event: HealEvent): event is PenanceHealEvent {
  return (event as PenanceHealEvent).penanceBoltNumber !== undefined;
}

export interface PenanceHealEvent extends HealEvent {
  penanceBoltNumber: number;
}
