import TALENTS from 'common/TALENTS/shaman';
import { stormbringerElementalist } from './StormbringerElementalist';
import Combatant from 'parser/core/Combatant';
import { stormbringerStorm } from './StormbringerStorm';
import { Apl } from 'parser/shared/metrics/apl';

export function getBuild(combatant: Combatant): Apl | undefined {
  if (combatant.hasTalent(TALENTS.TEMPEST_TALENT)) {
    return combatant.hasTalent(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT)
      ? stormbringerElementalist(combatant)
      : stormbringerStorm(combatant);
  }
  // totemic builds NYI
}
