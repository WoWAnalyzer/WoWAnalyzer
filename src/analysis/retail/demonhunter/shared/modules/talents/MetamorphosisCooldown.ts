import Combatant from 'parser/core/Combatant';
import { RUSH_OF_CHAOS_SCALING } from 'analysis/retail/demonhunter/shared/constants';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

// Base cooldown for meta is 3min for both specs
const BASE_COOLDOWN = 180;

export function getMetamorphosisCooldown(combatant: Combatant) {
  return (
    BASE_COOLDOWN -
    RUSH_OF_CHAOS_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.RUSH_OF_CHAOS_TALENT)]
  );
}
