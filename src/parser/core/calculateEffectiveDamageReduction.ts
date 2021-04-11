import { DamageEvent } from './Events';

export default function calculateEffectiveDamageReduction(event: DamageEvent, reduction: number) {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return (raw / (1 - reduction)) * reduction;
}
