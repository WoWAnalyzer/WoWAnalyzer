import SPELLS from 'common/SPELLS';
import { HealEvent } from 'parser/core/Events';

export default function isAtonement(event: HealEvent) {
  const spells: number[] = [SPELLS.ATONEMENT_HEAL_NON_CRIT.id, SPELLS.ATONEMENT_HEAL_CRIT.id];
  return spells.includes(event.ability.guid);
}
