import TALENTS from 'common/TALENTS/monk';
import { PlayerInfo, Apl } from 'parser/shared/metrics/apl';
import conduitOfTheCelestialsApl from './ConduitOfTheCelestialsApl';
import shadoPanApl from './ShadoPanApl';

export default function windwalkerApl(info: PlayerInfo): Apl {
  if (info.combatant.hasTalent(TALENTS.CELESTIAL_CONDUIT_WINDWALKER_TALENT)) {
    return conduitOfTheCelestialsApl(info.combatant);
  }

  return shadoPanApl(info.combatant);
}
