import SPELLS from 'common/SPELLS';
import STAT from 'parser/shared/modules/features/STAT';
import HIT_TYPES from 'game/HIT_TYPES';

import BaseHealerStatValues from 'parser/shared/modules/features/BaseHealerStatValues';
import Combatants from 'parser/shared/modules/Combatants';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import Mastery from '../core/EchoOfLightMastery';

import PRIEST_HEAL_INFO from './StatValuesSpellInfo';

/*
 * Holy Priest Stat Weights Methodology
 *
 * Approach -
 * This module generates the players stat weights using the actual logged events. We keep a listing of all the player's healing spells
 * along with which stats those spells scales with, and for each stat a heal scales with we do some simple math to find out
 * how much more it would have healed if the player had one more of that stat. We compare the total healing increases
 * caused by seperately increasing each stat by one in order to generate weights.
 *
 * Overheal -
 *
 * Stat Tracking -
 *
 * Intellect -
 *
 * Crit -
 *
 * Haste -
 *
 * Mastery -
 *
 * Versatility -
 *
 * Leech -
 *
 * Special Cases -
 *
 */
class StatWeights extends BaseHealerStatValues {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    mastery: Mastery,
  };

  spellInfo = PRIEST_HEAL_INFO;
  qeLive = true;


  _getCritChance(event) {
    return 0;
  }

  _criticalStrike(event, healVal) {
    return 0;
  }

  _hasteHpm(event, healVal) {
    return 0;
  }

  _mastery(event, healVal) {
    return 0;
  }

  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      // STAT.HASTE_HPCT, // TODO implement
      STAT.HASTE_HPM,
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }

}

export default StatWeights;
