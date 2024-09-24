import TALENTS from 'common/TALENTS/shaman';
import { stormbringerElementalist } from './StormbringerElementalist';
import Combatant from 'parser/core/Combatant';
import { stormbringerStorm } from './StormbringerStorm';
import { Apl } from 'parser/shared/metrics/apl';

export function getBuild(combatant: Combatant): Apl | undefined {
  if (combatant.hasTalent(TALENTS.TEMPEST_TALENT)) {
    return combatant.hasTalent(TALENTS.LASHING_FLAMES_TALENT)
      ? stormbringerElementalist(combatant) // the "elementalist" variant takes the Lava Lash nodes to lashing flames
      : stormbringerStorm(combatant); // the "storm" variant takes doomwinds, stormblast, and stormflurry (required by talent gates if not taking LL/LF)
  }
  // totemic builds NYI
}
