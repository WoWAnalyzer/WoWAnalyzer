import SPELLS from 'common/SPELLS';
import { HealEvent } from 'parser/core/Events';

export default function isAtonement(event: HealEvent) {
  return [SPELLS.ATONEMENT_HEAL_NON_CRIT.id, SPELLS.ATONEMENT_HEAL_CRIT.id].includes(event.ability.guid);
}
