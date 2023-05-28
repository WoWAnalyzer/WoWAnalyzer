import Combatant from 'parser/core/Combatant';
import {
  DEMONIC_ORIGINS_CDR_SCALING,
  RUSH_OF_CHAOS_SCALING,
} from 'analysis/retail/demonhunter/shared/constants';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';

// Base cooldown for meta is 4min for both specs
const BASE_COOLDOWN = 240;

export function getMetamorphosisCooldown(combatant: Combatant) {
  return (
    BASE_COOLDOWN -
    RUSH_OF_CHAOS_SCALING[combatant.getTalentRank(TALENTS_DEMON_HUNTER.RUSH_OF_CHAOS_TALENT)] -
    DEMONIC_ORIGINS_CDR_SCALING[
      combatant.getTalentRank(TALENTS_DEMON_HUNTER.FIRST_OF_THE_ILLIDARI_TALENT)
    ]
  );
}
