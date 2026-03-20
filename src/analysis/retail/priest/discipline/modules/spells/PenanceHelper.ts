import { DamageEvent, HealEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

interface PenanceEvent {
  penanceBoltNumber: number;
}

export type PenanceDamageEvent = DamageEvent & PenanceEvent;
export type PenanceHealEvent = HealEvent & PenanceEvent;

export function IsPenanceDamageEvent(event: DamageEvent): event is PenanceDamageEvent {
  return (event as PenanceDamageEvent).penanceBoltNumber !== undefined;
}
export function IsPenanceHealEvent(event: HealEvent): event is PenanceHealEvent {
  return (event as PenanceHealEvent).penanceBoltNumber !== undefined;
}

export function isPenance(spellId: number): boolean {
  return (
    spellId === SPELLS.PENANCE.id ||
    spellId === SPELLS.PENANCE_CAST.id ||
    spellId === SPELLS.PENANCE_HEAL.id ||
    spellId === SPELLS.DARK_REPRIMAND_DAMAGE.id ||
    spellId === SPELLS.DARK_REPRIMAND_CAST.id ||
    spellId === SPELLS.DARK_REPRIMAND_HEAL.id ||
    spellId === SPELLS.PENANCE_TWINSIGHT_DAMAGE.id ||
    spellId === SPELLS.PENANCE_TWINSIGHT_HEALING.id ||
    spellId === SPELLS.DARK_REPRIMAND_TWINSIGHT_DAMAGE.id ||
    spellId === SPELLS.DARK_REPRIMAND_TWINSIGHT_HEALING.id
  );
}
