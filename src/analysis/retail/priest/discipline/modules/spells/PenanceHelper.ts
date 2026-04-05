import { DamageEvent, HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

export enum PenanceBoltType {
  Normal,
  Twinsight,
}

export interface PenanceBoltEventInterface {
  penanceBoltNumber: number;
  penanceBoltType: PenanceBoltType;
}

export type PenanceDamageEvent = DamageEvent & PenanceBoltEventInterface;
export type PenanceHealEvent = HealEvent & PenanceBoltEventInterface;

export function IsPenanceDamageEvent(event: DamageEvent): event is PenanceDamageEvent {
  const penanceEvent = event as PenanceDamageEvent;
  return penanceEvent.penanceBoltNumber !== undefined && penanceEvent.penanceBoltType !== undefined;
}
export function IsPenanceHealEvent(event: HealEvent): event is PenanceHealEvent {
  const penanceEvent = event as PenanceHealEvent;
  return penanceEvent.penanceBoltNumber !== undefined && penanceEvent.penanceBoltType !== undefined;
}

export function isTwinsightPenanceBolt(spellId: number): boolean {
  return (
    spellId === SPELLS.PENANCE_TWINSIGHT_BOLT_DAMAGE.id ||
    spellId === SPELLS.PENANCE_TWINSIGHT_BOLT_HEAL.id
  );
}
