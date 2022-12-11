import { DamageEvent, HealEvent } from 'parser/core/Events';
import { HOLY_DAMAGE_SPELLS, SHADOW_DAMAGE_SPELLS } from '../../constants';

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

export const isShadowSpell = (id: number) => {
  return SHADOW_DAMAGE_SPELLS.includes(id);
};

export const isHolySpell = (id: number) => {
  return HOLY_DAMAGE_SPELLS.includes(id);
};
