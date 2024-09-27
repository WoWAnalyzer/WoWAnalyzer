import TALENTS from 'common/TALENTS/shaman';
import Combatant from 'parser/core/Combatant';
import { Apl } from 'parser/shared/metrics/apl';
import { stormbringer } from './Stormbringer';

export function getBuild(combatant: Combatant): Apl | undefined {
  if (combatant.hasTalent(TALENTS.TEMPEST_TALENT)) {
    return stormbringer(combatant);
  }
  // totemic builds NYI
}
