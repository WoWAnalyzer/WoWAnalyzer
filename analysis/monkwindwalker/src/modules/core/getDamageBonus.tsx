import { DamageEvent } from "parser/core/Events";

export default function getDamageBonus(event: DamageEvent, increase: number) {
  const raw = (event.amount || 0) + (event.absorbed || 0);
  return raw - (raw / (1 + increase));
}
