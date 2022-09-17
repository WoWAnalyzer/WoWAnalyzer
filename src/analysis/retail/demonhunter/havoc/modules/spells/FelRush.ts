import Combatant from 'parser/core/Combatant';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import { ERRATIC_FELHEART_SCALING } from 'analysis/retail/demonhunter/shared';

export function getFelRushCooldown(combatant: Combatant) {
  const baseCooldown = 10;
  const erraticFelheartReduction =
    ERRATIC_FELHEART_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.ERRATIC_FELHEART_TALENT)];
  const flatReduced = baseCooldown;
  return flatReduced - flatReduced * erraticFelheartReduction;
}
